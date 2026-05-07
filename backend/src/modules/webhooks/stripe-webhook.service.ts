import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderStatus, PaymentStatus, TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TICKET_EMAIL_QUEUE } from '../queues/constants/queue-names';
import { ReminderScheduler } from '../queues/reminder.scheduler';
import { TicketsGenerator } from '../tickets/tickets.generator';

// ── Tipos internos ────────────────────────────────────────────────────────────

type CheckoutSessionCompletedEvent = {
  id: string; // providerSessionId
  payment_intent: string | null; // providerPaymentId
  metadata: { orderId: string };
};

type CheckoutSessionExpiredEvent = {
  id: string; // providerSessionId
  metadata: { orderId: string };
};

type PaymentIntentFailedEvent = {
  id: string; // payment_intent id
  last_payment_error: { message?: string } | null;
};

type ChargeRefundedEvent = {
  payment_intent: string | null; // providerPaymentId
};

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsGenerator: TicketsGenerator,
    private readonly notificationsService: NotificationsService,
    private readonly reminderScheduler: ReminderScheduler,
    @InjectQueue(TICKET_EMAIL_QUEUE) private readonly ticketEmailQueue: Queue,
  ) {}

  // ── checkout.session.completed ───────────────────────────────────────────
  // Pago exitoso: marcar Payment COMPLETED + Order COMPLETED + generar Tickets
  // Todo en una sola transacción — si falla la generación de tickets,
  // se revierten también el payment y la order (atomicidad total)

  async handleCheckoutSessionCompleted(
    data: CheckoutSessionCompletedEvent,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerSessionId: data.id },
      select: { id: true, orderId: true, status: true },
    });

    if (!payment) {
      this.logger.warn(
        `checkout.session.completed: Payment no encontrado para session ${data.id}`,
      );
      return;
    }

    // Idempotency guard — Stripe entrega webhooks "at least once"
    // Si ya procesamos este pago, no generamos tickets duplicados
    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.warn(
        `checkout.session.completed: Payment ${payment.id} ya está COMPLETED — duplicado ignorado`,
      );
      return;
    }

    // Cambiamos de batch-array a callback para poder pasar tx al generator
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          providerPaymentId: data.payment_intent ?? undefined,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      await this.ticketsGenerator.generateForOrder(payment.orderId, tx);
    });

    this.logger.log(
      `Order ${payment.orderId} COMPLETED — tickets generados (session ${data.id})`,
    );

    // Notificaciones fuera de la transacción — no deben hacer fallar el webhook
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: payment.orderId },
        select: {
          totalAmount: true,
          buyer: { select: { email: true, name: true } },
          event: {
            select: {
              name: true,
              eventDate: true,
              venue: { select: { name: true } },
            },
          },
          _count: { select: { tickets: true } },
        },
      });

      if (order) {
        const { buyer, event, totalAmount, _count } = order;
        await this.notificationsService.sendOrderConfirmation(
          buyer.email,
          buyer.name,
          payment.orderId,
          event.name,
          totalAmount.toNumber(),
          _count.tickets,
        );
        await this.ticketEmailQueue.add('send-ticket-email', { orderId: payment.orderId });
        await this.reminderScheduler.scheduleReminders(
          payment.orderId,
          buyer.email,
          buyer.name,
          event.name,
          event.eventDate,
          event.venue.name,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error enviando notificaciones para order ${payment.orderId}`,
        error,
      );
    }
  }

  // ── checkout.session.expired ─────────────────────────────────────────────
  // El usuario abandonó el checkout: marcar Payment FAILED + Order CANCELLED
  // + revertir stock de cada TicketType

  async handleCheckoutSessionExpired(
    data: CheckoutSessionExpiredEvent,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerSessionId: data.id },
      select: { id: true, orderId: true, status: true },
    });

    if (!payment) {
      this.logger.warn(
        `checkout.session.expired: Payment no encontrado para session ${data.id}`,
      );
      return;
    }

    // Idempotency guard — no revertir stock dos veces
    if (payment.status === PaymentStatus.FAILED) {
      this.logger.warn(
        `checkout.session.expired: Payment ${payment.id} ya está FAILED — duplicado ignorado`,
      );
      return;
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
      select: { ticketTypeId: true, quantity: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    this.logger.log(
      `Order ${payment.orderId} cancelada por expiración de sesión (session ${data.id})`,
    );
  }

  // ── payment_intent.payment_failed ────────────────────────────────────────
  // Fallo de pago: marcar Payment FAILED con razón del error

  async handlePaymentIntentFailed(
    data: PaymentIntentFailedEvent,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId: data.id },
      select: { id: true, orderId: true, status: true },
    });

    if (!payment) {
      this.logger.warn(
        `payment_intent.payment_failed: Payment no encontrado para intent ${data.id}`,
      );
      return;
    }

    // Idempotency guard — no marcar FAILED si ya está en un estado terminal
    if (
      payment.status === PaymentStatus.FAILED ||
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      this.logger.warn(
        `payment_intent.payment_failed: Payment ${payment.id} ya está ${payment.status} — duplicado ignorado`,
      );
      return;
    }

    const failureReason =
      data.last_payment_error?.message ?? 'Pago rechazado por el procesador';

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason,
      },
    });

    this.logger.log(`Payment ${payment.id} marcado FAILED: ${failureReason}`);
  }

  // ── charge.refunded ──────────────────────────────────────────────────────
  // Reembolso: marcar Payment REFUNDED + Order REFUNDED + revertir stock

  async handleChargeRefunded(data: ChargeRefundedEvent): Promise<void> {
    if (!data.payment_intent) {
      this.logger.warn('charge.refunded sin payment_intent — ignorado');
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId: data.payment_intent },
      select: { id: true, orderId: true, status: true },
    });

    if (!payment) {
      this.logger.warn(
        `charge.refunded: Payment no encontrado para intent ${data.payment_intent}`,
      );
      return;
    }

    // Idempotency guard — no reembolsar dos veces
    if (payment.status === PaymentStatus.REFUNDED) {
      this.logger.warn(
        `charge.refunded: Payment ${payment.id} ya está REFUNDED — duplicado ignorado`,
      );
      return;
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
      select: { ticketTypeId: true, quantity: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.REFUNDED },
      });

      // Marcar todos los tickets de la orden como REFUNDED
      // Evita que puedan ser usados en la puerta después del reembolso
      await tx.ticket.updateMany({
        where: { orderId: payment.orderId },
        data: { status: TicketStatus.REFUNDED },
      });
    });

    this.logger.log(
      `Order ${payment.orderId} marcada REFUNDED — tickets invalidados (intent ${data.payment_intent})`,
    );

    // Notificaciones fuera de la transacción — no deben hacer fallar el webhook
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: payment.orderId },
        select: {
          totalAmount: true,
          buyer: { select: { email: true, name: true } },
          event: { select: { name: true } },
        },
      });

      if (order) {
        await this.notificationsService.sendRefundNotification(
          order.buyer.email,
          order.buyer.name,
          payment.orderId,
          order.event.name,
          order.totalAmount.toNumber(),
        );
      }
    } catch (error) {
      this.logger.error(
        `Error enviando notificación de reembolso para order ${payment.orderId}`,
        error,
      );
    }
  }
}
