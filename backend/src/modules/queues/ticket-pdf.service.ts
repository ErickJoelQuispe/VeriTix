import { createDecipheriv } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

// ── Ticket data shape ─────────────────────────────────────────────────────────

export interface TicketPdfData {
  ticketId: string;
  qrPayload: string;          // AES-256-GCM encrypted: iv:authTag:ciphertext (hex)
  buyerName: string;
  eventName: string;
  eventDate: Date;
  venueName: string;
  ticketTypeName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Decrypts an AES-256-GCM payload stored as "iv:authTag:ciphertext" (hex).
 * Replicates the inverse of encryptPayload() in tickets.generator.ts.
 */
function decryptPayload(encrypted: string, secret: string): string {
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted payload format — expected 3 parts, got ${parts.length}`);
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = Buffer.from(secret, 'utf8');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class TicketPdfService {
  private readonly logger = new Logger(TicketPdfService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Generates a PDF Buffer for a single ticket.
   * Decrypts qrPayload → renders QR code as image → builds PDF with event details.
   */
  async generatePdf(ticket: TicketPdfData): Promise<Buffer> {
    const secret = this.config.getOrThrow<string>('AES_SECRET_KEY');

    // Decrypt the QR payload to get the raw hash for QR encoding
    const qrContent = decryptPayload(ticket.qrPayload, secret);

    // Generate QR code as a PNG Buffer
    const qrImageBuffer = await QRCode.toBuffer(qrContent, {
      type: 'png',
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    // Build the PDF
    const buffer = await this.buildPdf(ticket, qrImageBuffer);
    this.logger.debug(`PDF generated for ticket ${ticket.ticketId}`);
    return buffer;
  }

  private buildPdf(ticket: TicketPdfData, qrImageBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A6', margin: 30 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const formattedDate = ticket.eventDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // ── Header ──────────────────────────────────────────────────────────────
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e')
        .text('VeriTix', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e')
        .text(ticket.eventName, { align: 'center' });

      doc.moveDown(0.4);

      // ── Event details ────────────────────────────────────────────────────────
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('FECHA', { align: 'left' });
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(formattedDate, { align: 'left' });

      doc.moveDown(0.4);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('RECINTO', { align: 'left' });
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(ticket.venueName, { align: 'left' });

      doc.moveDown(0.4);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('TIPO DE ENTRADA', { align: 'left' });
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(ticket.ticketTypeName, { align: 'left' });

      doc.moveDown(0.4);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('COMPRADOR', { align: 'left' });
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text(ticket.buyerName, { align: 'left' });

      doc.moveDown(0.6);

      // ── Divider ──────────────────────────────────────────────────────────────
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.margins.left + pageWidth, doc.y)
        .stroke();

      doc.moveDown(0.6);

      // ── QR code (centrado) ───────────────────────────────────────────────────
      const qrSize = 130;
      const qrX = doc.page.margins.left + (pageWidth - qrSize) / 2;

      doc.image(qrImageBuffer, qrX, doc.y, { width: qrSize, height: qrSize });
      doc.moveDown(0.3);
      doc.y += qrSize;

      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text(ticket.ticketId, { align: 'center' });

      doc.end();
    });
  }
}
