export function generatePasswordResetEmail(
  name: string,
  resetUrl: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset your password</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">VeriTix</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">Reset your password</h2>
          <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">Hi ${name}, we received a request to reset your VeriTix password. Click the button below to choose a new one.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background-color:#6366f1;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:6px;">Reset my password</a>
            </td></tr>
          </table>
          <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
          <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-top:24px;">
            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">If the button doesn't work, copy and paste this link into your browser:<br><span style="color:#6366f1;word-break:break-all;">${resetUrl}</span></p>
          </div>
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
