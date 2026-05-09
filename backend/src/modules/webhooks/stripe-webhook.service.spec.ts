import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TICKET_EMAIL_QUEUE } from '../queues/constants/queue-names';
import { ReminderScheduler } from '../queues/reminder.scheduler';
import { TicketsGenerator } from '../tickets/tickets.generator';
import { StripeWebhookService } from './stripe-webhook.service';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockPayment = {
  id: 'uuid-payment-1',
  orderId: 'uuid-order-1',
  status: PaymentStatus.PENDING,
};

const mockOrderForConfirmation = {
  totalAmount: { toNumber: () => 5000 },
  buyer: { email: 'buyer@test.com', name: 'Test Buyer' },
  event: {
    name: 'Test Event',
    eventDate: new Date('2026-12-01T20:00:00Z'),
    venue: { name: 'Test Venue' },
  },
  _count: { tickets: 2 },
};

const mockOrderForRefund = {
  totalAmount: { toNumber: () => 5000 },
  buyer: { email: 'buyer@test.com', name: 'Test Buyer' },
  event: { name: 'Test Event' },
};

const mockOrderItems = [
  { ticketTypeId: 'uuid-tt-1', quantity: 2 },
  { ticketTypeId: 'uuid-tt-2', quantity: 1 },
];

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrismaService = {
  payment: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  orderItem: {
    findMany: jest.fn(),
  },
  ticketType: {
    update: jest.fn(),
  },
  ticket: {
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockTicketsGenerator = {
  generateForOrder: jest.fn(),
};

const mockNotificationsService = {
  sendOrderConfirmation: jest.fn(),
  sendRefundNotification: jest.fn(),
};

const mockReminderScheduler = {
  scheduleReminders: jest.fn(),
};

const mockTicketEmailQueue = {
  add: jest.fn(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('StripeWebhookService', () => {
  let service: StripeWebhookService;
  let prisma: typeof mockPrismaService;
  let ticketsGenerator: typeof mockTicketsGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeWebhookService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TicketsGenerator, useValue: mockTicketsGenerator },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ReminderScheduler, useValue: mockReminderScheduler },
        { provide: getQueueToken(TICKET_EMAIL_QUEUE), useValue: mockTicketEmailQueue },
      ],
    }).compile();

    service = module.get<StripeWebhookService>(StripeWebhookService);
    prisma = module.get(PrismaService);
    ticketsGenerator = module.get(TicketsGenerator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── handleCheckoutSessionCompleted() ──────────────────────────────────────

  describe('handleCheckoutSessionCompleted()', () => {
    const sessionData = {
      id: 'cs_test_session_1',
      payment_intent: 'pi_test_intent_1',
      metadata: { orderId: 'uuid-order-1' },
    };

    beforeEach(() => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({});
      prisma.order.findUnique.mockResolvedValue(mockOrderForConfirmation);
      mockTicketsGenerator.generateForOrder.mockResolvedValue(undefined);
      mockNotificationsService.sendOrderConfirmation.mockResolvedValue(undefined);
      mockReminderScheduler.scheduleReminders.mockResolvedValue(undefined);
      mockTicketEmailQueue.add.mockResolvedValue(undefined);
      // $transaction callback — ejecuta con tx mock
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          payment: { update: prisma.payment.update },
          order: { update: prisma.order.update },
        };
        return cb(tx);
      });
    });

    it('should mark Payment COMPLETED and Order COMPLETED', async () => {
      await service.handleCheckoutSessionCompleted(sessionData);

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { providerSessionId: 'cs_test_session_1' },
        select: { id: true, orderId: true, status: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should skip processing when payment is already COMPLETED (idempotency guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });

      await service.handleCheckoutSessionCompleted(sessionData);

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(ticketsGenerator.generateForOrder).not.toHaveBeenCalled();
    });

    it('should call generateForOrder inside the transaction', async () => {
      await service.handleCheckoutSessionCompleted(sessionData);

      expect(ticketsGenerator.generateForOrder).toHaveBeenCalledWith(
        'uuid-order-1',
        expect.any(Object), // el tx
      );
    });

    it('should set providerPaymentId from payment_intent', async () => {
      await service.handleCheckoutSessionCompleted(sessionData);

      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'uuid-payment-1' },
          data: expect.objectContaining({
            status: PaymentStatus.COMPLETED,
            providerPaymentId: 'pi_test_intent_1',
          }),
        }),
      );
    });

    it('should mark Order COMPLETED', async () => {
      await service.handleCheckoutSessionCompleted(sessionData);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'uuid-order-1' },
        data: { status: OrderStatus.COMPLETED },
      });
    });

    it('should send order confirmation email after transaction', async () => {
      await service.handleCheckoutSessionCompleted(sessionData);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-order-1' },
        select: expect.objectContaining({
          buyer: expect.any(Object),
          event: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
      expect(mockNotificationsService.sendOrderConfirmation).toHaveBeenCalledWith(
        'buyer@test.com',
        'Test Buyer',
        'uuid-order-1',
        'Test Event',
        5000,
        2,
      );
    });

    it('should schedule reminders after transaction', async () => {
      await service.handleCheckoutSessionCompleted(sessionData);

      expect(mockReminderScheduler.scheduleReminders).toHaveBeenCalledWith(
        'uuid-order-1',
        'buyer@test.com',
        'Test Buyer',
        'Test Event',
        mockOrderForConfirmation.event.eventDate,
        'Test Venue',
      );
    });

    it('should not fail webhook if notification throws', async () => {
      mockNotificationsService.sendOrderConfirmation.mockRejectedValue(
        new Error('Resend error'),
      );

      await expect(service.handleCheckoutSessionCompleted(sessionData)).resolves.toBeUndefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should do nothing if Payment not found (idempotent)', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await service.handleCheckoutSessionCompleted(sessionData);

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(ticketsGenerator.generateForOrder).not.toHaveBeenCalled();
    });
  });

  // ── handleCheckoutSessionExpired() ────────────────────────────────────────

  describe('handleCheckoutSessionExpired()', () => {
    const sessionData = {
      id: 'cs_test_session_1',
      metadata: { orderId: 'uuid-order-1' },
    };

    beforeEach(() => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.orderItem.findMany.mockResolvedValue(mockOrderItems);
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
        };
        return cb(tx);
      });
    });

    it('should mark Payment FAILED, Order CANCELLED and revert stock', async () => {
      await service.handleCheckoutSessionExpired(sessionData);

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { providerSessionId: 'cs_test_session_1' },
        select: { id: true, orderId: true, status: true },
      });
      expect(prisma.orderItem.findMany).toHaveBeenCalledWith({
        where: { orderId: 'uuid-order-1' },
        select: { ticketTypeId: true, quantity: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should NOT call generateForOrder', async () => {
      await service.handleCheckoutSessionExpired(sessionData);

      expect(ticketsGenerator.generateForOrder).not.toHaveBeenCalled();
    });

    it('should increment availableQuantity for each order item in transaction', async () => {
      const txTicketUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: txTicketUpdate },
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
        };
        return cb(tx);
      });

      await service.handleCheckoutSessionExpired(sessionData);

      expect(txTicketUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-tt-1' },
        data: { availableQuantity: { increment: 2 } },
      });
      expect(txTicketUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-tt-2' },
        data: { availableQuantity: { increment: 1 } },
      });
    });

    it('should mark Payment FAILED inside transaction', async () => {
      const txPaymentUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          payment: { update: txPaymentUpdate },
          order: { update: jest.fn() },
        };
        return cb(tx);
      });

      await service.handleCheckoutSessionExpired(sessionData);

      expect(txPaymentUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-payment-1' },
        data: { status: PaymentStatus.FAILED },
      });
    });

    it('should mark Order CANCELLED inside transaction', async () => {
      const txOrderUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          payment: { update: jest.fn() },
          order: { update: txOrderUpdate },
        };
        return cb(tx);
      });

      await service.handleCheckoutSessionExpired(sessionData);

      expect(txOrderUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-order-1' },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    it('should skip processing when payment is already FAILED (idempotency guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      await service.handleCheckoutSessionExpired(sessionData);

      expect(prisma.orderItem.findMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should do nothing if Payment not found (idempotent)', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await service.handleCheckoutSessionExpired(sessionData);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  // ── handlePaymentIntentFailed() ───────────────────────────────────────────

  describe('handlePaymentIntentFailed()', () => {
    const intentData = {
      id: 'pi_test_intent_1',
      last_payment_error: {
        message: 'Tu tarjeta no tiene fondos suficientes.',
      },
    };

    it('should mark Payment FAILED with failureReason', async () => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({});

      await service.handlePaymentIntentFailed(intentData);

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { providerPaymentId: 'pi_test_intent_1' },
        select: { id: true, orderId: true, status: true },
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'uuid-payment-1' },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: 'Tu tarjeta no tiene fondos suficientes.',
        },
      });
    });

    it('should NOT call generateForOrder', async () => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({});

      await service.handlePaymentIntentFailed(intentData);

      expect(ticketsGenerator.generateForOrder).not.toHaveBeenCalled();
    });

    it('should use default failureReason when last_payment_error has no message', async () => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({});

      await service.handlePaymentIntentFailed({
        id: 'pi_test_intent_1',
        last_payment_error: null,
      });

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'uuid-payment-1' },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: 'Pago rechazado por el procesador',
        },
      });
    });

    it('should skip processing when payment is already FAILED (idempotency guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      await service.handlePaymentIntentFailed(intentData);

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('should skip processing when payment is already COMPLETED (idempotency guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });

      await service.handlePaymentIntentFailed(intentData);

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('should skip processing when payment is already REFUNDED (idempotency guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });

      await service.handlePaymentIntentFailed(intentData);

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('should do nothing if Payment not found (idempotent)', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await service.handlePaymentIntentFailed(intentData);

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });
  });

  // ── handleChargeRefunded() ────────────────────────────────────────────────

  describe('handleChargeRefunded()', () => {
    const chargeData = {
      payment_intent: 'pi_test_intent_1',
    };

    beforeEach(() => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);
      prisma.orderItem.findMany.mockResolvedValue(mockOrderItems);
      prisma.order.findUnique.mockResolvedValue(mockOrderForRefund);
      mockNotificationsService.sendRefundNotification.mockResolvedValue(undefined);
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
          ticket: { updateMany: jest.fn() },
        };
        return cb(tx);
      });
    });

    it('should mark Payment REFUNDED, Order REFUNDED and revert stock', async () => {
      await service.handleChargeRefunded(chargeData);

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { providerPaymentId: 'pi_test_intent_1' },
        select: { id: true, orderId: true, status: true },
      });
      expect(prisma.orderItem.findMany).toHaveBeenCalledWith({
        where: { orderId: 'uuid-order-1' },
        select: { ticketTypeId: true, quantity: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should NOT call generateForOrder', async () => {
      await service.handleChargeRefunded(chargeData);

      expect(ticketsGenerator.generateForOrder).not.toHaveBeenCalled();
    });

    it('should increment stock for each item in transaction', async () => {
      const txTicketUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: txTicketUpdate },
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
          ticket: { updateMany: jest.fn() },
        };
        return cb(tx);
      });

      await service.handleChargeRefunded(chargeData);

      expect(txTicketUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-tt-1' },
        data: { availableQuantity: { increment: 2 } },
      });
      expect(txTicketUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-tt-2' },
        data: { availableQuantity: { increment: 1 } },
      });
    });

    it('should mark Order REFUNDED inside transaction', async () => {
      const txOrderUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          payment: { update: jest.fn() },
          order: { update: txOrderUpdate },
          ticket: { updateMany: jest.fn() },
        };
        return cb(tx);
      });

      await service.handleChargeRefunded(chargeData);

      expect(txOrderUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-order-1' },
        data: { status: OrderStatus.REFUNDED },
      });
    });

    it('should mark all tickets of the order as REFUNDED inside transaction', async () => {
      const txTicketUpdateMany = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          payment: { update: jest.fn() },
          order: { update: jest.fn() },
          ticket: { updateMany: txTicketUpdateMany },
        };
        return cb(tx);
      });

      await service.handleChargeRefunded(chargeData);

      expect(txTicketUpdateMany).toHaveBeenCalledWith({
        where: { orderId: 'uuid-order-1' },
        data: { status: 'REFUNDED' },
      });
    });

    it('should send refund notification email after transaction', async () => {
      await service.handleChargeRefunded(chargeData);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-order-1' },
        select: expect.objectContaining({
          buyer: expect.any(Object),
          event: expect.any(Object),
        }),
      });
      expect(mockNotificationsService.sendRefundNotification).toHaveBeenCalledWith(
        'buyer@test.com',
        'Test Buyer',
        'uuid-order-1',
        'Test Event',
        5000,
      );
    });

    it('should not fail webhook if refund notification throws', async () => {
      mockNotificationsService.sendRefundNotification.mockRejectedValue(
        new Error('Resend error'),
      );

      await expect(service.handleChargeRefunded(chargeData)).resolves.toBeUndefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should skip processing when payment is already REFUNDED (idempotency guard)', async () => {
      prisma.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });

      await service.handleChargeRefunded(chargeData);

      expect(prisma.orderItem.findMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should do nothing when payment_intent is null', async () => {
      await service.handleChargeRefunded({ payment_intent: null });

      expect(prisma.payment.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should do nothing if Payment not found (idempotent)', async () => {
      prisma.payment.findUnique.mockResolvedValue(null);

      await service.handleChargeRefunded(chargeData);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
