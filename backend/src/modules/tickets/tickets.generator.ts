import { createCipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// ── Type alias inferido del callback de $transaction ─────────────────────────
// Evita depender de paths internos de Prisma
export type PrismaTransactionClient = Parameters<
  Parameters<PrismaService['$transaction']>[0]
>[0];

// ── Crypto ────────────────────────────────────────────────────────────────────

export function encryptPayload(hash: string, secret: string): string {
  const key = Buffer.from(secret, 'utf8'); // 32 bytes = AES-256
  const iv = randomBytes(12);              // 12 bytes estándar para GCM

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(hash, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes

  // Formato: iv:authTag:ciphertext — todo en hex, separado por ':'
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

// ── Generator ─────────────────────────────────────────────────────────────────

@Injectable()
export class TicketsGenerator {
  constructor(private readonly config: ConfigService) {}

  /**
   * Genera un ticket individual por cada unidad en cada OrderItem.
   * Debe llamarse DENTRO de una transacción de Prisma existente.
   *
   * Flujo:
   *   OrderItem { quantity: 3, ticketTypeId: "..." }
   *   → genera 3 tickets con hash único por cada uno
   */
  async generateForOrder(
    orderId: string,
    tx: PrismaTransactionClient,
  ): Promise<void> {
    // Cargar la orden con los datos necesarios para generar tickets
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: {
        buyerId: true,
        eventId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            ticketTypeId: true,
          },
        },
      },
    });

    const secret = this.config.getOrThrow<string>('AES_SECRET_KEY');
    const ticketsToCreate: {
      id: string;
      hash: string;
      qrPayload: string;
      eventId: string;
      buyerId: string;
      ticketTypeId: string;
      orderId: string;
      orderItemId: string;
    }[] = [];

    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const id = randomUUID();

        // SHA256(id + eventId + buyerId + orderItemId + timestamp + secret)
        // Cada ticket tiene un hash único e irrepetible
        const hash = createHash('sha256')
          .update(
            `${id}${order.eventId}${order.buyerId}${item.id}${Date.now()}${secret}`,
          )
          .digest('hex');

        ticketsToCreate.push({
          id,
          hash,
          qrPayload: encryptPayload(hash, secret), // AES-256-GCM: el QR contiene el payload cifrado
          eventId: order.eventId,
          buyerId: order.buyerId,
          ticketTypeId: item.ticketTypeId,
          orderId,
          orderItemId: item.id,
        });
      }
    }

    if (ticketsToCreate.length === 0) return;

    await tx.ticket.createMany({ data: ticketsToCreate });
  }
}
