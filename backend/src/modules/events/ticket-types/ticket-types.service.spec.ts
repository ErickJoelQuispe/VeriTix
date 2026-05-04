import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto';
import { TicketTypesRepository } from './ticket-types.repository';
import { TicketTypesService } from './ticket-types.service';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockEvent = {
  id: 'uuid-event-1',
  creatorId: 'uuid-creator-1',
  maxCapacity: 1000,
};

const mockTicketType = {
  id: 'uuid-tt-1',
  name: 'General',
  description: null,
  price: { toString: () => '350', valueOf: () => 350 } as any,
  totalQuantity: 500,
  availableQuantity: 500,
  maxPerUser: 4,
  isActive: true,
  saleStartDate: null,
  saleEndDate: null,
  eventId: 'uuid-event-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockTicketTypesRepository = {
  findByEventId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaService = {
  event: {
    findUnique: jest.fn(),
  },
  ticketType: {
    aggregate: jest.fn(),
  },
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('TicketTypesService', () => {
  let service: TicketTypesService;
  let repo: typeof mockTicketTypesRepository;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketTypesService,
        { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TicketTypesService>(TicketTypesService);
    repo = module.get(TicketTypesRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateTicketTypeDto = {
      name: 'General',
      price: 350,
      totalQuantity: 500,
    };

    it('should create a ticket type when user is the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.ticketType.aggregate.mockResolvedValue({ _sum: { totalQuantity: 400 } });
      repo.create.mockResolvedValue(mockTicketType);

      const result = await service.create('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-event-1' },
        select: { id: true, creatorId: true, maxCapacity: true },
      });
      expect(repo.create).toHaveBeenCalledWith('uuid-event-1', dto);
      expect(result.price).toBe(Number(mockTicketType.price));
    });

    it('should create a ticket type when user is ADMIN', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.ticketType.aggregate.mockResolvedValue({ _sum: { totalQuantity: 0 } });
      repo.create.mockResolvedValue(mockTicketType);

      await service.create('uuid-event-1', 'uuid-admin', Role.ADMIN, dto);

      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.create('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.create('uuid-event-1', 'uuid-other', Role.CREATOR, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should create when existing sum + new totalQuantity equals maxCapacity', async () => {
      // 500 existing + 500 new = 1000 === maxCapacity → OK
      prisma.event.findUnique.mockResolvedValue(mockEvent); // maxCapacity: 1000
      prisma.ticketType.aggregate.mockResolvedValue({ _sum: { totalQuantity: 500 } });
      repo.create.mockResolvedValue(mockTicketType);

      const result = await service.create('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(repo.create).toHaveBeenCalledWith('uuid-event-1', dto);
      expect(result.price).toBe(Number(mockTicketType.price));
    });

    it('should throw BadRequestException when capacity would be exceeded on create', async () => {
      // 600 existing + 500 new = 1100 > 1000 maxCapacity → throws
      prisma.event.findUnique.mockResolvedValue(mockEvent); // maxCapacity: 1000
      prisma.ticketType.aggregate.mockResolvedValue({ _sum: { totalQuantity: 600 } });

      await expect(
        service.create('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(BadRequestException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findByEvent() ─────────────────────────────────────────────────────────

  describe('findByEvent()', () => {
    it('should return ticket types for an existing event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findByEventId.mockResolvedValue([mockTicketType]);

      const result = await service.findByEvent('uuid-event-1');

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(Number(mockTicketType.price));
      expect(repo.findByEventId).toHaveBeenCalledWith('uuid-event-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findByEvent('uuid-not-found')).rejects.toThrow(NotFoundException);
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    const dto: UpdateTicketTypeDto = { name: 'VIP' };
    const updatedTicketType = { ...mockTicketType, name: 'VIP' };

    it('should update ticket type when user is creator and ticket belongs to event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(mockTicketType);
      repo.update.mockResolvedValue(updatedTicketType);

      const result = await service.update('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(result.name).toBe('VIP');
      expect(repo.update).toHaveBeenCalledWith('uuid-tt-1', dto);
    });

    it('should not validate capacity when totalQuantity is not in dto', async () => {
      // dto = { name: 'VIP' } — no totalQuantity, so no aggregate call
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(mockTicketType);
      repo.update.mockResolvedValue(updatedTicketType);

      await service.update('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(prisma.ticketType.aggregate).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('uuid-tt-1', dto);
    });

    it('should update when new sum (excluding self) does not exceed maxCapacity', async () => {
      const dtoWithQuantity: UpdateTicketTypeDto = { totalQuantity: 300 };
      const updatedWithQuantity = { ...mockTicketType, totalQuantity: 300 };
      // sum of OTHER ticket types = 500; new value = 300 → 500 + 300 = 800 ≤ 1000 → OK
      prisma.event.findUnique.mockResolvedValue(mockEvent); // maxCapacity: 1000
      repo.findById.mockResolvedValue(mockTicketType);
      prisma.ticketType.aggregate.mockResolvedValue({ _sum: { totalQuantity: 500 } });
      repo.update.mockResolvedValue(updatedWithQuantity);

      const result = await service.update('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR, dtoWithQuantity);

      expect(prisma.ticketType.aggregate).toHaveBeenCalledWith({
        where: { eventId: 'uuid-event-1', id: { not: 'uuid-tt-1' } },
        _sum: { totalQuantity: true },
      });
      expect(result.totalQuantity).toBe(300);
    });

    it('should throw BadRequestException when capacity would be exceeded on update', async () => {
      const dtoWithQuantity: UpdateTicketTypeDto = { totalQuantity: 600 };
      // sum of OTHER ticket types = 500; new value = 600 → 500 + 600 = 1100 > 1000 → throws
      prisma.event.findUnique.mockResolvedValue(mockEvent); // maxCapacity: 1000
      repo.findById.mockResolvedValue(mockTicketType);
      prisma.ticketType.aggregate.mockResolvedValue({ _sum: { totalQuantity: 500 } });

      await expect(
        service.update('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR, dtoWithQuantity),
      ).rejects.toThrow(BadRequestException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.update('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.update('uuid-event-1', 'uuid-tt-1', 'uuid-other', Role.CREATOR, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when ticket type does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('uuid-event-1', 'uuid-not-found', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when ticket type belongs to a different event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue({ ...mockTicketType, eventId: 'uuid-other-event' });

      await expect(
        service.update('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow ADMIN to update any ticket type', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(mockTicketType);
      repo.update.mockResolvedValue(updatedTicketType);

      const result = await service.update('uuid-event-1', 'uuid-tt-1', 'uuid-admin', Role.ADMIN, dto);

      expect(result.name).toBe('VIP');
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should delete ticket type when user is creator and ticket belongs to event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(mockTicketType);
      repo.delete.mockResolvedValue(mockTicketType);

      await service.remove('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR);

      expect(repo.delete).toHaveBeenCalledWith('uuid-tt-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.remove('uuid-event-1', 'uuid-tt-1', 'uuid-other', Role.CREATOR),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when ticket type does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(null);

      await expect(
        service.remove('uuid-event-1', 'uuid-not-found', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when ticket type belongs to a different event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue({ ...mockTicketType, eventId: 'uuid-other-event' });

      await expect(
        service.remove('uuid-event-1', 'uuid-tt-1', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
