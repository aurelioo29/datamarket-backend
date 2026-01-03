const BRAND_NAME = 'Dataset Market';
const SUPPORT_EMAIL = 'lunacrestroleplay@gmail.com'; // atau ganti ke email resmi nanti
const OTP_EXPIRE_MINUTES = 5;

export function buildRegisterOtpEmail(code: string) {
  const subject = `Kode Verifikasi ${BRAND_NAME}`;

  const text = `
Halo,

Terima kasih telah mendaftar di ${BRAND_NAME}.
Berikut adalah kode verifikasi akun Anda:

${code}

Kode ini berlaku selama ${OTP_EXPIRE_MINUTES} menit.
Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.

Salam,
${BRAND_NAME}
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(135deg,#111827,#1f2933);color:#f9fafb;">
                <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.8;">Verifikasi Akun</div>
                <div style="font-size:20px;font-weight:600;margin-top:4px;">${BRAND_NAME}</div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 24px 8px 24px;color:#111827;">
                <p style="margin:0 0 12px 0;font-size:15px;">Halo,</p>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">
                  Terima kasih telah mendaftar di <strong>${BRAND_NAME}</strong>.<br/>
                  Gunakan kode berikut untuk memverifikasi akun Anda:
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:8px 24px 20px 24px;">
                <div style="
                  display:inline-block;
                  padding:12px 24px;
                  border-radius:999px;
                  background-color:#111827;
                  color:#f9fafb;
                  font-size:24px;
                  letter-spacing:0.35em;
                  font-weight:600;
                  text-align:center;
                ">
                  <span style="letter-spacing:0.35em;">${code}</span>
                </div>
                <p style="margin:16px 0 0 0;font-size:13px;color:#6b7280;">
                  Kode ini berlaku selama <strong>${OTP_EXPIRE_MINUTES} menit</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 20px 24px;color:#4b5563;font-size:13px;line-height:1.6;">
                <p style="margin:0 0 8px 0;">
                  Jika Anda tidak merasa melakukan pendaftaran, Anda dapat mengabaikan email ini. Akun tidak akan aktif tanpa verifikasi.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px;line-height:1.6;text-align:center;">
                <div>${BRAND_NAME}</div>
                <div style="margin-top:4px;">
                  Email ini dikirim otomatis. Bila Anda butuh bantuan, hubungi
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#4b5563;text-decoration:underline;">${SUPPORT_EMAIL}</a>.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return { subject, text, html };
}

export function buildResetPasswordEmail(code: string) {
  const subject = `Kode Reset Password ${BRAND_NAME}`;

  const text = `
Halo,

Kami menerima permintaan untuk mereset password akun Anda di ${BRAND_NAME}.
Berikut adalah kode verifikasi untuk reset password:

${code}

Kode ini berlaku selama ${OTP_EXPIRE_MINUTES} menit.
Jika Anda tidak merasa meminta reset password, abaikan email ini dan jangan bagikan kode ini ke siapa pun.

Salam,
${BRAND_NAME}
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(135deg,#7c2d12,#111827);color:#f9fafb;">
                <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">Reset Password</div>
                <div style="font-size:20px;font-weight:600;margin-top:4px;">${BRAND_NAME}</div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 24px 8px 24px;color:#111827;">
                <p style="margin:0 0 12px 0;font-size:15px;">Halo,</p>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">
                  Kami menerima permintaan untuk <strong>reset password</strong> akun Anda di ${BRAND_NAME}.<br/>
                  Gunakan kode di bawah ini untuk melanjutkan proses reset:
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:8px 24px 16px 24px;">
                <div style="
                  display:inline-block;
                  padding:12px 24px;
                  border-radius:999px;
                  background-color:#111827;
                  color:#f9fafb;
                  font-size:24px;
                  letter-spacing:0.35em;
                  font-weight:600;
                  text-align:center;
                ">
                  <span style="letter-spacing:0.35em;">${code}</span>
                </div>
                <p style="margin:16px 0 0 0;font-size:13px;color:#6b7280;">
                  Kode ini berlaku selama <strong>${OTP_EXPIRE_MINUTES} menit</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 16px 24px;color:#b91c1c;background-color:#fef2f2;border-top:1px solid #fee2e2;font-size:12px;line-height:1.6;">
                <p style="margin:10px 0 6px 0;font-weight:600;">Penting:</p>
                <ul style="margin:0 0 8px 18px;padding:0;">
                  <li>Jangan bagikan kode ini kepada siapa pun.</li>
                  <li>${BRAND_NAME} tidak akan pernah meminta kode OTP lewat chat atau telepon.</li>
                  <li>Abaikan email ini jika Anda tidak merasa meminta reset password.</li>
                </ul>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px;line-height:1.6;text-align:center;">
                <div>${BRAND_NAME}</div>
                <div style="margin-top:4px;">
                  Butuh bantuan? Hubungi
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#4b5563;text-decoration:underline;">${SUPPORT_EMAIL}</a>.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return { subject, text, html };
}

type AccountActivatedOptions = {
  appName?: string;
  username?: string | null;
};

export function buildAccountActivatedEmail(options: AccountActivatedOptions) {
  const appName = options.appName ?? BRAND_NAME;
  const safeName = options.username || 'Pengguna';

  const subject = `Akun ${appName} sudah aktif 🎉`;

  const text = `
Halo ${safeName},

Selamat! Akun ${appName} kamu sudah berhasil diverifikasi dan sekarang resmi aktif.

Kamu sudah bisa login dan mulai menggunakan semua fitur yang tersedia.

Kalau kamu merasa tidak pernah mendaftar, silakan abaikan email ini atau hubungi tim support kami di ${SUPPORT_EMAIL}.

Salam,
${appName}
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:20px 24px;background:linear-gradient(135deg,#16a34a,#111827);color:#f9fafb;">
                <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">
                  Akun Berhasil Diaktifkan
                </div>
                <div style="font-size:20px;font-weight:600;margin-top:4px;">${appName}</div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 24px 8px 24px;color:#111827;">
                <p style="margin:0 0 12px 0;font-size:15px;">Halo ${safeName},</p>
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;">
                  Selamat! Akun kamu di <strong>${appName}</strong> sudah berhasil
                  <strong>diverifikasi</strong> dan sekarang <strong>resmi aktif</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 20px 24px;color:#4b5563;font-size:14px;line-height:1.6;">
                <p style="margin:0 0 10px 0;">
                  Kamu sekarang sudah bisa:
                </p>
                <ul style="margin:0 0 8px 18px;padding:0;">
                  <li>Login ke dashboard ${appName}</li>
                  <li>Mengakses fitur-fitur utama yang tersedia</li>
                  <li>Mengelola data dan pengaturan akunmu</li>
                </ul>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px;line-height:1.6;text-align:center;">
                <div>${appName}</div>
                <div style="margin-top:4px;">
                  Email ini dikirim otomatis. Bila kamu butuh bantuan, hubungi
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#4b5563;text-decoration:underline;">${SUPPORT_EMAIL}</a>.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return { subject, text, html };
}
