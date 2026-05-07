import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';
import { TICKET_EMAIL_QUEUE } from './constants/queue-names';
import { TicketPdfService } from './ticket-pdf.service';

// ── Job payload ───────────────────────────────────────────────────────────────

interface TicketEmailJobData {
  orderId: string;
}

// ── Processor ─────────────────────────────────────────────────────────────────

@Processor(TICKET_EMAIL_QUEUE)
export class TicketEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketEmailProcessor.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketPdfService: TicketPdfService,
    private readonly config: ConfigService,
  ) {
    super();
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.fromEmail = this.config.get<string>('EMAIL_FROM') ?? '';
  }

  async process(job: Job<TicketEmailJobData>): Promise<void> {
    const { orderId } = job.data;

    this.logger.log(`Processing ticket-email job ${job.id} for order ${orderId}`);

    try {
      // ── Load order with all required relations ───────────────────────────────
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          buyer: {
            select: { email: true, name: true },
          },
          event: {
            select: {
              name: true,
              eventDate: true,
              venue: { select: { name: true } },
            },
          },
          tickets: {
            select: {
              id: true,
              qrPayload: true,
              ticketType: { select: { name: true } },
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`ticket-email: Order ${orderId} not found — job skipped`);
        return;
      }

      if (order.tickets.length === 0) {
        this.logger.warn(`ticket-email: Order ${orderId} has no tickets — job skipped`);
        return;
      }

      // ── Generate PDF per ticket ──────────────────────────────────────────────
      const attachments: { filename: string; content: string }[] = [];

      for (const ticket of order.tickets) {
        if (!ticket.qrPayload) {
          this.logger.warn(
            `ticket-email: Ticket ${ticket.id} has no qrPayload — skipping this ticket`,
          );
          continue;
        }

        try {
          const pdfBuffer = await this.ticketPdfService.generatePdf({
            ticketId: ticket.id,
            qrPayload: ticket.qrPayload,
            buyerName: order.buyer.name,
            eventName: order.event.name,
            eventDate: new Date(order.event.eventDate),
            venueName: order.event.venue.name,
            ticketTypeName: ticket.ticketType.name,
          });

          attachments.push({
            filename: `ticket-${ticket.id}.pdf`,
            content: pdfBuffer.toString('base64'),
          });
        } catch (pdfError) {
          this.logger.error(
            `ticket-email: Failed to generate PDF for ticket ${ticket.id}`,
            pdfError,
          );
          // Continue with remaining tickets
        }
      }

      if (attachments.length === 0) {
        this.logger.warn(
          `ticket-email: No PDFs could be generated for order ${orderId} — email not sent`,
        );
        return;
      }

      // ── Send a single email with all PDFs attached ───────────────────────────
      const subject = `Tus entradas para ${order.event.name}`;
      const html = generateTicketEmailHtml(
        order.buyer.name,
        order.event.name,
        new Date(order.event.eventDate),
        order.event.venue.name,
        attachments.length,
      );

      await this.resend.emails.send({
        from: this.fromEmail,
        to: order.buyer.email,
        subject,
        html,
        attachments,
      });

      this.logger.log(
        `ticket-email: Sent ${attachments.length} ticket(s) for order ${orderId} to ${order.buyer.email}`,
      );
    } catch (error) {
      this.logger.error(
        `ticket-email: Unhandled error processing job ${job.id} for order ${orderId}`,
        error,
      );
      throw error; // Re-throw so BullMQ can retry the job according to its retry policy
    }
  }
}

// ── Email template ────────────────────────────────────────────────────────────

function generateTicketEmailHtml(
  buyerName: string,
  eventName: string,
  eventDate: Date,
  venueName: string,
  ticketCount: number,
): string {
  const formattedDate = eventDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Tus entradas</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">VeriTix</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">¡Tus entradas están listas, ${buyerName}!</h2>
          <p style="margin:0 0 32px;color:#4b5563;font-size:16px;line-height:1.6;">Encontrás tus entradas adjuntas como PDF en este correo. Presentalas en la puerta el día del evento.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:32px;">
            <tr><td style="padding:16px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Evento</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${eventName}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Fecha</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${formattedDate}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Recinto</p>
              <p style="margin:4px 0 0;color:#1a1a2e;font-size:15px;font-weight:600;">${venueName}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Entradas adjuntas</p>
              <p style="margin:4px 0 0;color:#6366f1;font-size:15px;font-weight:700;">${ticketCount} entrada${ticketCount !== 1 ? 's' : ''}</p>
            </td></tr>
          </table>
          <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6;">Recordá llevar el PDF (impreso o en tu teléfono) el día del evento. ¡Disfrutalo!</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:13px;">&copy; ${new Date().getFullYear()} VeriTix. Todos los derechos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
