export interface TransferInviteEmailParams {
  senderName: string;
  eventName: string;
  eventDate: string;
  acceptUrl: string;
  isNewUser: boolean;
}

export function generateTransferInviteEmail(params: TransferInviteEmailParams): string {
  const { senderName, eventName, eventDate, acceptUrl, isNewUser } = params;

  const ctaText = isNewUser ? 'Create Account & Accept Transfer' : 'Accept Transfer';

  const registrationNote = isNewUser
    ? `<p style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.6;">
        You'll need to create a free VeriTix account to accept this transfer and manage your ticket.
      </p>`
    : '';

  const bodyText = isNewUser
    ? `<strong>${senderName}</strong> wants to transfer a ticket to you. To accept, you'll need to sign up for a free VeriTix account first.`
    : `<strong>${senderName}</strong> has transferred a ticket to you. Accept it to claim ownership and add it to your account.`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>You received a ticket transfer</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">VeriTix</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="display:inline-block;background-color:#ecfdf5;color:#059669;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">Ticket Transfer</span>
          </div>
          <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;text-align:center;">You've received a ticket!</h2>
          <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">${bodyText}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:32px;">
            <tr><td style="padding:20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Event</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:17px;font-weight:700;">${eventName}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Date</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${eventDate}</p>
            </td></tr>
          </table>
          ${registrationNote}
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${acceptUrl}" style="display:inline-block;background-color:#6366f1;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:600;">${ctaText}</a>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6;">This transfer offer expires in 48 hours. If you did not expect this transfer, you can safely ignore this email.</p>
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
