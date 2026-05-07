export function generateVerificationEmail(name: string, verificationUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify your email</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">VeriTix</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">Verify your email address</h2>
          <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">Hi ${name},</p>
          <p style="margin:0 0 32px;color:#4b5563;font-size:16px;line-height:1.6;">Thanks for signing up! Please verify your email address to activate your account.</p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${verificationUrl}" style="display:inline-block;background-color:#6366f1;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:600;">Verify Email</a>
          </div>
          <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;">This link expires in 24 hours.</p>
          <p style="margin:0;color:#9ca3af;font-size:14px;">If you didn't create an account, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:13px;">&copy; ${new Date().getFullYear()} VeriTix. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
