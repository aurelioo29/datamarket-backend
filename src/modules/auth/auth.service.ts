import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { OtpType, User } from '@prisma/client';
import {
  buildRegisterOtpEmail,
  buildResetPasswordEmail,
  buildAccountActivatedEmail,
} from './email-templates';

@Injectable()
export class AuthService {
  private mailer: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    // setup nodemailer sekali di constructor
    this.mailer = nodemailer.createTransport({
      host: this.config.get<string>('smtp.host'),
      port: this.config.get<number>('smtp.port'),
      secure: this.config.get<boolean>('smtp.secure') ?? false,
      auth: {
        user: this.config.get<string>('smtp.user'),
        pass: this.config.get<string>('smtp.pass'),
      },
    });
  }

  // ========== HELPER ==========

  private generateOtp(length = 5): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  private async sendEmailRaw(
    to: string,
    subject: string,
    text: string,
    html: string,
  ) {
    await this.mailer.sendMail({
      from:
        this.config.get<string>('smtp.from') ??
        this.config.get<string>('smtp.user'),
      to,
      subject,
      text,
      html,
    });
  }

  private get accessSecret(): string {
    const secret = this.config.get<string>('jwt.accessTokenSecret');
    if (!secret) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET is not set');
    }
    return secret;
  }
  private get accessExpiresIn() {
    return this.config.get<string>('jwt.accessTokenExpiresIn') ?? '15m';
  }
  private get refreshSecret(): string {
    const secret = this.config.get<string>('jwt.refreshTokenSecret');
    if (!secret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not set');
    }
    return secret;
  }

  private get refreshExpiresIn() {
    return this.config.get<string>('jwt.refreshTokenExpiresIn') ?? '7d';
  }

  private async generateTokens(user: User) {
    const payload: { sub: number; username: string; role: string } = {
      sub: user.id,
      username: user.username,
      role: user.role as unknown as string,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      } as any, // kalau TS masih rese, ini bikin dia diem
    );

    const refreshPayload: { sub: number; username: string } = {
      sub: user.id,
      username: user.username,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    } as any);

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: hash },
    });

    return { accessToken, refreshToken };
  }

  private async ensureOtpCooldown(
    userId: number,
    type: OtpType,
    cooldownMs = 5 * 60 * 1000,
  ) {
    const lastOtp = await this.prisma.otpCode.findFirst({
      where: { userId, type },
      orderBy: { created_at: 'desc' },
    });

    if (!lastOtp) return;

    const now = Date.now();
    const last = lastOtp.created_at.getTime();
    if (now - last < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - last)) / 1000);
      throw new BadRequestException(
        `Silakan coba kirim ulang OTP dalam ${remaining} detik`,
      );
    }
  }

  // ========== REGISTER FLOW ==========

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password dan konfirmasi tidak sama');
    }

    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const existingUsername = await this.usersService.findByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new BadRequestException('Username sudah terdaftar');
    }

    // buat user (belum verified)
    const user = await this.usersService.createUser({
      email: dto.email,
      username: dto.username,
      password: dto.password,
    });

    // cek cooldown OTP
    await this.ensureOtpCooldown(user.id, OtpType.REGISTER);

    const code = this.generateOtp(5);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: OtpType.REGISTER,
        expires_at: expiresAt,
      },
    });

    const { subject, text, html } = buildRegisterOtpEmail(code);
    await this.sendEmailRaw(user.email, subject, text, html);

    return { message: 'User dibuat. OTP telah dikirim ke email.' };
  }

  async verifyRegisterOtp(dto: VerifyOtpDto) {
    const user = dto.email
      ? await this.usersService.findByEmail(dto.email)
      : dto.username
        ? await this.usersService.findByUsername(dto.username)
        : null;

    if (!user) throw new NotFoundException('User tidak ditemukan');

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        type: OtpType.REGISTER,
        code: dto.code,
        used_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otp) throw new BadRequestException('OTP tidak valid');

    if (otp.expires_at < new Date()) {
      throw new BadRequestException('OTP sudah kadaluarsa');
    }

    await this.prisma.$transaction([
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { used_at: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { is_verified: true },
      }),
    ]);

    const appName = this.config.get<string>('app.name') ?? 'Dataset Market';
    const { subject, text, html } = buildAccountActivatedEmail({
      appName,
      username: user.username,
    });

    await this.sendEmailRaw(user.email, subject, text, html);

    // generate token seperti sebelumnya
    const tokens = await this.generateTokens(user);
    return {
      message: 'Verifikasi berhasil',
      ...tokens,
    };
  }

  async resendRegisterOtp(dto: RequestOtpDto) {
    const user = await this.usersService.findByEmail(dto.identifier);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // pastikan user belum terverifikasi
    if (user.is_verified) {
      throw new BadRequestException('Akun sudah diverifikasi');
    }

    // cek cooldown
    await this.ensureOtpCooldown(user.id, OtpType.REGISTER);

    // generate otp baru
    const code = this.generateOtp(5);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // simpan ke DB
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: OtpType.REGISTER,
        expires_at: expiresAt,
      },
    });

    // pakai template yang sama dengan register
    const { subject, text, html } = buildRegisterOtpEmail(code);

    // override subject agar user tahu ini resend
    const subjectResend = subject + ' (kirim ulang)';

    await this.sendEmailRaw(user.email, subjectResend, text, html);

    return { message: 'OTP baru telah dikirim ke email.' };
  }

  // ========== LOGIN & REFRESH ==========

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(dto.identifier);

    if (!user) throw new NotFoundException('User tidak ditemukan');

    if (!user.password) {
      throw new BadRequestException('User tidak memiliki password');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Username/email atau password salah');
    }

    if (!user.is_verified) {
      throw new UnauthorizedException('Akun belum diverifikasi');
    }

    const tokens = await this.generateTokens(user);

    return {
      message: 'Login berhasil',
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        username: string;
      }>(dto.refreshToken, {
        secret: this.refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refresh_token) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      const isMatch = await bcrypt.compare(
        dto.refreshToken,
        user.refresh_token,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      const tokens = await this.generateTokens(user);
      return {
        message: 'Token diperbarui',
        ...tokens,
      };
    } catch (err) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  // ========== FORGOT PASSWORD ==========

  async requestResetPassword(dto: RequestOtpDto) {
    const user = await this.usersService.findByEmailOrUsername(dto.identifier);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    await this.ensureOtpCooldown(user.id, OtpType.RESET_PASSWORD);

    const code = this.generateOtp(5);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: OtpType.RESET_PASSWORD,
        expires_at: expiresAt,
      },
    });

    const { subject, text, html } = buildResetPasswordEmail(code);
    await this.sendEmailRaw(user.email, subject, text, html);

    return { message: 'OTP reset password telah dikirim ke email.' };
  }

  async verifyResetOtp(dto: VerifyOtpDto) {
    const user = dto.email
      ? await this.usersService.findByEmail(dto.email)
      : dto.username
        ? await this.usersService.findByUsername(dto.username)
        : null;

    if (!user) throw new NotFoundException('User tidak ditemukan');

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        type: OtpType.RESET_PASSWORD,
        code: dto.code,
        used_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otp) throw new BadRequestException('OTP tidak valid');
    if (otp.expires_at < new Date()) {
      throw new BadRequestException('OTP sudah kadaluarsa');
    }

    // di sini kita cuma bilang "OK", FE bisa lanjut ke page isi password baru
    return { message: 'OTP valid, silakan lanjut ganti password.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('Password baru dan konfirmasi tidak sama');
    }

    const user = await this.usersService.findByEmailOrUsername(dto.identifier);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        type: OtpType.RESET_PASSWORD,
        code: dto.code,
        used_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otp) throw new BadRequestException('OTP tidak valid');
    if (otp.expires_at < new Date()) {
      throw new BadRequestException('OTP sudah kadaluarsa');
    }

    // cek password baru tidak sama dengan lama
    if (user.password) {
      const same = await bcrypt.compare(dto.newPassword, user.password);
      if (same) {
        throw new BadRequestException(
          'Password baru tidak boleh sama dengan password lama',
        );
      }
    }

    await this.usersService.updatePassword(user.id, dto.newPassword);

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used_at: new Date() },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: null }, // paksa logout semua device
    });

    return { message: 'Password berhasil diubah. Silakan login kembali.' };
  }
}
