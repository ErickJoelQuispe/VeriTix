import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { EventStatus, OrderStatus, Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import { CreateOrderDto } from './dto';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockTicketType = {
  id: 'uuid-tt-1',
  name: 'Pista General',
  price: '75.00',
  availableQuantity: 100,
  maxPerUser: 4,
  saleStartDate: null,
  saleEndDate: null,
};

const mockEvent = {
  id: 'uuid-event-1',
  name: 'Noche Indie en Granada',
  status: EventStatus.PUBLISHED,
  startSale: null,
  endSale: null,
  currency: 'EUR',
  imageUrl: null,
};

const mockOrderDetail = {
  id: 'uuid-order-1',
  totalAmount: '150.00',
  status: OrderStatus.PENDING,
  buyerId: 'uuid-buyer-1',
  createdAt: new Date('2026-04-06T10:00:00Z'),
  updatedAt: new Date('2026-04-06T10:00:00Z'),
  event: {
    id: 'uuid-event-1',
    name: 'Noche Indie en Granada',
    eventDate: new Date('2026-12-31T21:00:00Z'),
    currency: 'EUR',
  },
  items: [
    {
      id: 'uuid-item-1',
      quantity: 2,
      unitPrice: '75.00',
      subtotal: '150.00',
      ticketType: { id: 'uuid-tt-1', name: 'Pista General', price: '75.00' },
    },
  ],
  payments: [],
};

const mockOrderListItem = {
  id: 'uuid-order-1',
  totalAmount: '150.00',
  status: OrderStatus.PENDING,
  createdAt: new Date('2026-04-06T10:00:00Z'),
  event: {
    id: 'uuid-event-1',
    name: 'Noche Indie en Granada',
    eventDate: new Date('2026-12-31T21:00:00Z'),
  },
  payments: [],
};

const mockPaginated = {
  data: [mockOrderListItem],
  meta: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const mockStripeSession = {
  id: 'cs_test_stripe_session_1',
  url: 'https://checkout.stripe.com/pay/cs_test_stripe_session_1',
};

const mockBuyer: JwtPayload = {
  sub: 'uuid-buyer-1',
  email: 'buyer@test.com',
  role: Role.BUYER,
};

const mockAdmin: JwtPayload = {
  sub: 'uuid-admin-1',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockOtherUser: JwtPayload = {
  sub: 'uuid-other-1',
  email: 'other@test.com',
  role: Role.BUYER,
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockOrdersRepository = {
  findByBuyer: jest.fn(),
  findByEvent: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
};

const mockPrismaService = {
  event: { findUnique: jest.fn() },
  ticketType: { findMany: jest.fn(), update: jest.fn() },
  order: { create: jest.fn(), update: jest.fn() },
  payment: { create: jest.fn() },
  $transaction: jest.fn(),
};

const mockStripeClient = {
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('https://veritix.com'),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('OrdersService', () => {
  let service: OrdersService;
  let repo: jest.Mocked<OrdersRepository>;
  let prisma: typeof mockPrismaService;
  let stripeClient: typeof mockStripeClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrdersRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: STRIPE_CLIENT, useValue: mockStripeClient },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repo = module.get(OrdersRepository) as jest.Mocked<OrdersRepository>;
    prisma = module.get(PrismaService);
    stripeClient = module.get(STRIPE_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ──────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateOrderDto = {
      eventId: 'uuid-event-1',
      items: [{ ticketTypeId: 'uuid-tt-1', quantity: 2 }],
    };

    beforeEach(() => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.ticketType.findMany.mockResolvedValue([mockTicketType]);
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          order: { create: jest.fn().mockResolvedValue(mockOrderDetail) },
        };
        return cb(tx);
      });
      stripeClient.checkout.sessions.create.mockResolvedValue(
        mockStripeSession,
      );
      prisma.payment.create.mockResolvedValue({});
    });

    it('should create order, stripe session, and payment — returning checkoutUrl', async () => {
      const result = await service.create('uuid-buyer-1', dto);

      expect(result.totalAmount).toBe(150);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.checkoutUrl).toBe(mockStripeSession.url);
    });

    it('should call stripe.checkout.sessions.create with correct params', async () => {
      await service.create('uuid-buyer-1', dto);

      expect(stripeClient.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          metadata: { orderId: 'uuid-order-1' },
          success_url: 'https://veritix.com/orders/uuid-order-1/success',
          cancel_url: 'https://veritix.com/orders/uuid-order-1/cancel',
        }),
      );
    });

    it('should set expires_at to ~30 minutes from now', async () => {
      const before = Math.floor(Date.now() / 1000) + 30 * 60;
      await service.create('uuid-buyer-1', dto);
      const after = Math.floor(Date.now() / 1000) + 30 * 60;

      const call = stripeClient.checkout.sessions.create.mock.calls[0][0];
      expect(call.expires_at).toBeGreaterThanOrEqual(before - 5);
      expect(call.expires_at).toBeLessThanOrEqual(after + 5);
    });

    it('should create Payment PENDING with providerSessionId', async () => {
      await service.create('uuid-buyer-1', dto);

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'uuid-order-1',
          amount: 150,
          currency: 'EUR',
          providerSessionId: 'cs_test_stripe_session_1',
        }),
      });
    });

    it('should convert currency to lowercase for stripe line_items', async () => {
      await service.create('uuid-buyer-1', dto);

      const call = stripeClient.checkout.sessions.create.mock.calls[0][0];
      expect(call.line_items[0].price_data.currency).toBe('eur');
    });

    it('should convert unit_amount to cents (×100)', async () => {
      await service.create('uuid-buyer-1', dto);

      const call = stripeClient.checkout.sessions.create.mock.calls[0][0];
      // 75.00 EUR → 7500 cents
      expect(call.line_items[0].price_data.unit_amount).toBe(7500);
    });

    it('should rollback order and revert stock when Stripe fails', async () => {
      stripeClient.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe network error'),
      );

      // Segundo $transaction para el rollback
      let callCount = 0;
      prisma.$transaction.mockImplementation(async (cb: any) => {
        callCount++;
        if (callCount === 1) {
          // Primera transacción: crear order
          const tx = {
            ticketType: { update: jest.fn() },
            order: { create: jest.fn().mockResolvedValue(mockOrderDetail) },
          };
          return cb(tx);
        } else {
          // Segunda transacción: rollback
          const tx = {
            ticketType: { update: jest.fn() },
            order: { update: jest.fn() },
          };
          return cb(tx);
        }
      });

      await expect(service.create('uuid-buyer-1', dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      // Se llamó $transaction dos veces: crear + rollback
      expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.create('uuid-buyer-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(stripeClient.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when event is not PUBLISHED', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.DRAFT,
      });

      await expect(service.create('uuid-buyer-1', dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(stripeClient.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when sale has not started yet', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        startSale: new Date(Date.now() + 86400000),
      });

      await expect(service.create('uuid-buyer-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when sale has already ended', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        endSale: new Date(Date.now() - 86400000),
      });

      await expect(service.create('uuid-buyer-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when ticketTypeId does not belong to event', async () => {
      prisma.ticketType.findMany.mockResolvedValue([]);

      await expect(service.create('uuid-buyer-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnprocessableEntityException when quantity exceeds maxPerUser', async () => {
      prisma.ticketType.findMany.mockResolvedValue([
        { ...mockTicketType, maxPerUser: 1 },
      ]);
      const dtoExceeds: CreateOrderDto = {
        eventId: 'uuid-event-1',
        items: [{ ticketTypeId: 'uuid-tt-1', quantity: 2 }],
      };

      await expect(service.create('uuid-buyer-1', dtoExceeds)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when stock is insufficient', async () => {
      prisma.ticketType.findMany.mockResolvedValue([
        { ...mockTicketType, availableQuantity: 1 },
      ]);
      const dtoExceeds: CreateOrderDto = {
        eventId: 'uuid-event-1',
        items: [{ ticketTypeId: 'uuid-tt-1', quantity: 2 }],
      };

      await expect(service.create('uuid-buyer-1', dtoExceeds)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should decrement stock inside transaction', async () => {
      const txTicketUpdate = jest.fn();
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: txTicketUpdate },
          order: { create: jest.fn().mockResolvedValue(mockOrderDetail) },
        };
        return cb(tx);
      });

      await service.create('uuid-buyer-1', dto);

      expect(txTicketUpdate).toHaveBeenCalledWith({
        where: { id: 'uuid-tt-1' },
        data: { availableQuantity: { decrement: 2 } },
      });
    });
  });

  // ── findMyOrders() ────────────────────────────────────────────────────────

  describe('findMyOrders()', () => {
    it('should delegate to repository and map to response DTOs', async () => {
      repo.findByBuyer.mockResolvedValue(mockPaginated as any);

      const result = await service.findMyOrders('uuid-buyer-1', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].totalAmount).toBe(150);
      expect(repo.findByBuyer).toHaveBeenCalledWith('uuid-buyer-1', 1, 10);
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return order detail when buyer is the owner', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
      } as any);

      const result = await service.findOne('uuid-order-1', mockBuyer);

      expect(result.id).toBe('uuid-order-1');
      expect(result.totalAmount).toBe(150);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.findOne('uuid-not-found', mockBuyer),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the buyer', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
      } as any);

      await expect(
        service.findOne('uuid-order-1', mockOtherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to see any order', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
      } as any);

      const result = await service.findOne('uuid-order-1', mockAdmin);

      expect(result.id).toBe('uuid-order-1');
    });
  });

  // ── cancel() ─────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    beforeEach(() => {
      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ticketType: { update: jest.fn() },
          order: { update: jest.fn() },
        };
        return cb(tx);
      });
    });

    it('should cancel a PENDING order and revert stock', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
      } as any);

      await service.cancel('uuid-order-1', mockBuyer);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.cancel('uuid-not-found', mockBuyer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the buyer', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
      } as any);

      await expect(
        service.cancel('uuid-order-1', mockOtherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when order is not PENDING', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
        status: OrderStatus.COMPLETED,
      } as any);

      await expect(service.cancel('uuid-order-1', mockBuyer)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to cancel any PENDING order', async () => {
      repo.findById.mockResolvedValue({
        ...mockOrderDetail,
        buyerId: 'uuid-buyer-1',
      } as any);

      await service.cancel('uuid-order-1', mockAdmin);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ── findByEvent() ─────────────────────────────────────────────────────────

  describe('findByEvent()', () => {
    const mockCreator: JwtPayload = {
      sub: 'uuid-creator-1',
      email: 'creator@test.com',
      role: Role.CREATOR,
    };
    const mockEventRow = { id: 'uuid-event-1', creatorId: 'uuid-creator-1' };
    const query = { page: 1, limit: 10, status: undefined };

    it('should return paginated orders for event creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventRow);
      repo.findByEvent.mockResolvedValue(mockPaginated as any);

      const result = await service.findByEvent(
        'uuid-event-1',
        mockCreator,
        query as any,
      );

      expect(result.data).toHaveLength(1);
      expect(repo.findByEvent).toHaveBeenCalledWith(
        'uuid-event-1',
        1,
        10,
        undefined,
      );
    });

    it('should allow ADMIN to see orders for any event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventRow);
      repo.findByEvent.mockResolvedValue(mockPaginated as any);

      const result = await service.findByEvent(
        'uuid-event-1',
        mockAdmin,
        query as any,
      );

      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.findByEvent('uuid-not-found', mockCreator, query as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventRow);

      await expect(
        service.findByEvent('uuid-event-1', mockBuyer, query as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
