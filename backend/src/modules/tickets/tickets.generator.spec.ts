import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsGenerator } from './tickets.generator';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockOrder = {
  buyerId: 'uuid-buyer-1',
  eventId: 'uuid-event-1',
  items: [
    { id: 'uuid-item-1', quantity: 2, ticketTypeId: 'uuid-tt-1' },
    { id: 'uuid-item-2', quantity: 1, ticketTypeId: 'uuid-tt-2' },
  ],
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockTx = {
  order: { findUniqueOrThrow: jest.fn() },
  ticket: { createMany: jest.fn() },
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('test-secret-key-32-chars-exactly'), // exactly 32 bytes
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('TicketsGenerator', () => {
  let generator: TicketsGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsGenerator,
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    generator = module.get<TicketsGenerator>(TicketsGenerator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateForOrder()', () => {
    beforeEach(() => {
      mockTx.order.findUniqueOrThrow.mockResolvedValue(mockOrder);
      mockTx.ticket.createMany.mockResolvedValue({ count: 3 });
    });

    it('should create 1 ticket per unit in each OrderItem', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      expect(mockTx.ticket.createMany).toHaveBeenCalledTimes(1);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];
      // item-1 qty 2 + item-2 qty 1 = 3 tickets
      expect(data).toHaveLength(3);
    });

    it('should assign correct fields to each ticket', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];

      for (const ticket of data) {
        expect(ticket.eventId).toBe('uuid-event-1');
        expect(ticket.buyerId).toBe('uuid-buyer-1');
        expect(ticket.orderId).toBe('uuid-order-1');
      }
    });

    it('should assign correct ticketTypeId and orderItemId per item', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];

      const fromItem1 = data.filter((t: any) => t.orderItemId === 'uuid-item-1');
      const fromItem2 = data.filter((t: any) => t.orderItemId === 'uuid-item-2');

      expect(fromItem1).toHaveLength(2);
      expect(fromItem2).toHaveLength(1);

      expect(fromItem1[0].ticketTypeId).toBe('uuid-tt-1');
      expect(fromItem2[0].ticketTypeId).toBe('uuid-tt-2');
    });

    it('should generate unique hash for every ticket', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];
      const hashes = data.map((t: any) => t.hash);
      const uniqueHashes = new Set(hashes);

      expect(uniqueHashes.size).toBe(hashes.length);
    });

    it('should generate non-empty hash string', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];

      for (const ticket of data) {
        expect(typeof ticket.hash).toBe('string');
        expect(ticket.hash.length).toBeGreaterThan(0);
      }
    });

    it('qrPayload es distinto del hash (cifrado AES-256-GCM)', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];

      for (const ticket of data) {
        expect(ticket.qrPayload).not.toBe(ticket.hash);
      }
    });

    it('qrPayload tiene formato iv:authTag:ciphertext en hex', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];

      for (const ticket of data) {
        expect(ticket.qrPayload).toMatch(/^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/);
      }
    });

    it('qrPayload es único por ticket (IV aleatorio garantiza unicidad)', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];
      const payloads = data.map((t: any) => t.qrPayload);
      const uniquePayloads = new Set(payloads);

      expect(uniquePayloads.size).toBe(payloads.length);
    });

    it('should use the order data from the transaction client', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      expect(mockTx.order.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'uuid-order-1' },
        select: {
          buyerId: true,
          eventId: true,
          items: {
            select: { id: true, quantity: true, ticketTypeId: true },
          },
        },
      });
    });

    it('should not call createMany when order has no items', async () => {
      mockTx.order.findUniqueOrThrow.mockResolvedValue({
        ...mockOrder,
        items: [],
      });

      await generator.generateForOrder('uuid-order-1', mockTx as any);

      expect(mockTx.ticket.createMany).not.toHaveBeenCalled();
    });

    it('should generate hash as a 64-character hex string (SHA256)', async () => {
      await generator.generateForOrder('uuid-order-1', mockTx as any);

      const { data } = mockTx.ticket.createMany.mock.calls[0][0];

      for (const ticket of data) {
        expect(ticket.hash).toMatch(/^[a-f0-9]{64}$/);
      }
    });
  });
});
