export interface FavoriteAlertEmailParams {
  userName: string;
  eventName: string;
  alertType: 'SELLING_OUT' | 'NEW_TICKET_TYPE';
  eventUrl: string;
}

export function generateFavoriteAlertEmail(params: FavoriteAlertEmailParams): string {
  const { userName, eventName, alertType, eventUrl } = params;

  const isSelling = alertType === 'SELLING_OUT';

  const badgeText = isSelling ? 'Almost Sold Out!' : 'New Ticket Type Available!';
  const badgeColor = isSelling ? '#ef4444' : '#6366f1';
  const badgeBg = isSelling ? '#fef2f2' : '#eef2ff';

  const heading = isSelling
    ? `${eventName} is almost sold out`
    : `New tickets available for ${eventName}`;

  const body = isSelling
    ? `Only a few tickets remain for <strong>${eventName}</strong>. Don't miss your chance — grab yours before they're gone!`
    : `Good news! A new ticket type is now available for <strong>${eventName}</strong>. Check it out and secure your spot.`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${heading}</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">VeriTix</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="display:inline-block;background-color:${badgeBg};color:${badgeColor};padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">${badgeText}</span>
          </div>
          <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;text-align:center;">${heading}</h2>
          <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">Hi ${userName},</p>
          <p style="margin:0 0 32px;color:#4b5563;font-size:16px;line-height:1.6;">${body}</p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${eventUrl}" style="display:inline-block;background-color:#6366f1;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:600;">View Event</a>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:14px;">You're receiving this because you favorited this event on VeriTix.</p>
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
