export function generateOrderConfirmationEmail(
  name: string,
  orderId: string,
  eventName: string,
  totalAmount: number,
  ticketCount: number,
): string {
  const formattedAmount = (totalAmount / 100).toFixed(2);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">VeriTix</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">Your order is confirmed!</h2>
          <p style="margin:0 0 32px;color:#4b5563;font-size:16px;line-height:1.6;">Hi ${name}, thanks for your purchase. Here's a summary of your order.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:32px;">
            <tr><td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Order ID</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${orderId}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Event</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${eventName}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Tickets</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${ticketCount} ticket${ticketCount !== 1 ? 's' : ''}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Total</p>
              <p style="margin:4px 0 0;color:#6366f1;font-size:18px;font-weight:700;">$${formattedAmount}</p>
            </td></tr>
          </table>
          <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6;">Your tickets will be available in your account. Enjoy the event!</p>
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
