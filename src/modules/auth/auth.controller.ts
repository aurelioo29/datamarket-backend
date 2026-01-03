import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // REGISTER
  @Post('register')
  @ApiOperation({
    summary: 'Register user baru',
    description:
      'Mendaftarkan user baru dengan email & username, lalu mengirim email verifikasi berisi kode OTP.',
  })
  @ApiResponse({ status: 201, description: 'User berhasil terdaftar.' })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid (password tidak cocok / format salah).',
  })
  @ApiResponse({
    status: 409,
    description: 'Email atau username sudah digunakan.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/verify')
  @ApiOperation({
    summary: 'Verifikasi pendaftaran dengan OTP',
    description:
      'Memverifikasi akun user menggunakan kode OTP yang dikirim saat register.',
  })
  @ApiResponse({ status: 200, description: 'Akun berhasil diverifikasi.' })
  @ApiResponse({
    status: 400,
    description: 'Kode OTP tidak valid / kadaluarsa.',
  })
  verifyRegister(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegisterOtp(dto);
  }

  @Post('register/resend')
  @ApiOperation({
    summary: 'Kirim ulang OTP verifikasi register',
    description:
      'Mengirim ulang kode OTP ke user yang belum menyelesaikan verifikasi akun.',
  })
  @ApiResponse({ status: 200, description: 'OTP berhasil dikirim ulang.' })
  @ApiResponse({
    status: 404,
    description: 'User tidak ditemukan atau sudah terverifikasi.',
  })
  resendRegisterOtp(@Body() dto: RequestOtpDto) {
    return this.authService.resendRegisterOtp(dto);
  }

  // LOGIN
  @Post('login')
  @ApiOperation({
    summary: 'Login dan dapatkan access token',
    description:
      'Menerima identifier (email/username) dan password, lalu mengembalikan access & refresh token.',
  })
  @ApiResponse({ status: 201, description: 'Berhasil login.' })
  @ApiResponse({ status: 401, description: 'Credential tidak valid.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // REFRESH TOKEN
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Mengganti access token lama dengan yang baru menggunakan refresh token yang masih valid.',
  })
  @ApiResponse({ status: 201, description: 'Token berhasil direfresh.' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token tidak valid atau sudah kadaluarsa.',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  // FORGOT PASSWORD
  @Post('forgot-password/request')
  @ApiOperation({
    summary: 'Minta OTP untuk reset password',
    description:
      'Mengirimkan kode OTP ke user berdasarkan identifier (email/username) untuk proses reset password.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP reset password berhasil dikirim.',
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan.' })
  requestReset(@Body() dto: RequestOtpDto) {
    return this.authService.requestResetPassword(dto);
  }

  @Post('forgot-password/verify')
  @ApiOperation({
    summary: 'Verifikasi OTP reset password',
    description:
      'Memvalidasi kode OTP reset password sebelum user mengganti password.',
  })
  @ApiResponse({ status: 200, description: 'OTP valid.' })
  @ApiResponse({ status: 400, description: 'OTP tidak valid / kadaluarsa.' })
  verifyResetOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Post('forgot-password/reset')
  @ApiOperation({
    summary: 'Reset password dengan OTP yang sudah terverifikasi',
    description:
      'Mengganti password lama dengan password baru setelah OTP reset password terverifikasi.',
  })
  @ApiResponse({ status: 200, description: 'Password berhasil direset.' })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid (OTP salah / password tidak cocok).',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
