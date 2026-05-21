import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { CacheService } from '../../cache';
import { EventStatus, Role, TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, EventQueryDto, TopEventsQueryDto, UpcomingQueryDto, UpdateEventDto } from './dto';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { TicketsRepository } from '../tickets/tickets.repository';
import { BuyerEventsQueryDto } from './dto/buyer-events-query.dto';
import { RevenueByDateRow } from './events.repository';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockVenueRow = { id: 'uuid-venue-1' };

const mockEventDetail = {
  id: 'uuid-event-1',
  name: 'Rock en el Foro',
  description: null,
  eventDate: new Date('2025-12-31T21:00:00Z'),
  doorsOpenTime: null,
  startSale: null,
  endSale: null,
  maxCapacity: 5000,
  status: EventStatus.DRAFT,
  imageUrl: null,
  currency: 'MXN',
  creatorId: 'uuid-creator-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  venue: {
    id: 'uuid-venue-1',
    name: 'Foro Sol',
    slug: 'foro-sol',
    address: 'Av. Viaducto',
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'MX',
    capacity: 65000,
    type: 'FORO',
    imageUrl: null,
  },
  format: null,
  genres: [],
};

const mockEventListItem = {
  id: 'uuid-event-1',
  name: 'Rock en el Foro',
  eventDate: new Date('2025-12-31T21:00:00Z'),
  status: EventStatus.PUBLISHED,
  imageUrl: null,
  currency: 'MXN',
  venue: { id: 'uuid-venue-1', name: 'Foro Sol', city: 'Ciudad de México' },
  format: null,
};

const mockPaginated = {
  data: [mockEventListItem],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockEventsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByCreator: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  findUpcoming: jest.fn(),
  findRequiresAttention: jest.fn(),
  findTopEvents: jest.fn(),
  findMetricsById: jest.fn(),
  findRevenueByDate: jest.fn(),
};

const mockTicketsRepository = {
  findByBuyerWithEvents: jest.fn(),
};

const mockPrismaService = {
  venue: {
    findUnique: jest.fn(),
  },
  ticketType: {
    findFirst: jest.fn(),
  },
};

const mockCacheService = {
  getOrSet: jest.fn(async (_key: string, fn: () => Promise<unknown>) => fn()),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('EventsService', () => {
  let service: EventsService;
  let repo: jest.Mocked<EventsRepository>;
  let ticketsRepo: jest.Mocked<TicketsRepository>;
  let prisma: typeof mockPrismaService;
  let cache: typeof mockCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventsRepository, useValue: mockEventsRepository },
        { provide: TicketsRepository, useValue: mockTicketsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repo = module.get(EventsRepository) as jest.Mocked<EventsRepository>;
    ticketsRepo = module.get(TicketsRepository) as jest.Mocked<TicketsRepository>;
    prisma = module.get(PrismaService);
    cache = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateEventDto = {
      name: 'Rock en el Foro',
      eventDate: '2025-12-31T21:00:00Z',
      maxCapacity: 5000,
      venueId: 'uuid-venue-1',
    };

    it('should create an event when venue exists', async () => {
      prisma.venue.findUnique.mockResolvedValue(mockVenueRow);
      repo.create.mockResolvedValue(mockEventDetail);

      const result = await service.create('uuid-creator-1', dto);

      expect(prisma.venue.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-venue-1' },
        select: { id: true },
      });
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        creatorId: 'uuid-creator-1',
      });
      expect(result).toEqual(mockEventDetail);
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      prisma.venue.findUnique.mockResolvedValue(null);

      await expect(service.create('uuid-creator-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should delegate to repository and return paginated response', async () => {
      const query: EventQueryDto = { page: 1, limit: 10 };
      repo.findAll.mockResolvedValue(mockPaginated as any);

      const result = await service.findAll(query);

      expect(result).toEqual(mockPaginated);
      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        city: undefined,
        genreId: undefined,
        formatId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        search: undefined,
        artistName: undefined,
      });
      expect(cache.getOrSet).toHaveBeenCalled();
    });

    it('should pass filters to repository', async () => {
      const query: EventQueryDto = {
        page: 1,
        limit: 5,
        city: 'CDMX',
        search: 'Rock',
        artistName: 'The Killers',
        venueName: 'Arena',
      };
      repo.findAll.mockResolvedValue(mockPaginated as any);

      await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        city: 'CDMX',
        genreId: undefined,
        formatId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        search: 'Rock',
        artistName: 'The Killers',
      });
    });
  });

  // ── findMyEvents() ───────────────────────────────────────────────────────

  describe('findMyEvents()', () => {
    it('should delegate to repository findByCreator', async () => {
      repo.findByCreator.mockResolvedValue(mockPaginated as any);

      const result = await service.findMyEvents('uuid-creator-1', 1, 10);

      expect(result).toEqual(mockPaginated);
      expect(repo.findByCreator).toHaveBeenCalledWith('uuid-creator-1', 1, 10);
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    const publishedEvent = { ...mockEventDetail, status: EventStatus.PUBLISHED };

    it('should return the event when found and published', async () => {
      repo.findById.mockResolvedValue(publishedEvent);

      const result = await service.findOne('uuid-event-1');

      expect(result).toEqual(publishedEvent);
      expect(repo.findById).toHaveBeenCalledWith('uuid-event-1');
      expect(cache.getOrSet).toHaveBeenCalled();
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow creator to see their own DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      const creatorUser: JwtPayload = {
        sub: 'uuid-creator-1',
        email: 'creator@test.com',
        role: Role.CREATOR,
      };

      const result = await service.findOne('uuid-event-1', creatorUser);

      expect(result).toEqual(mockEventDetail);
    });

    it('should throw NotFoundException for non-owner trying to see a DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT, creatorId: uuid-creator-1
      const otherUser: JwtPayload = {
        sub: 'uuid-other-user',
        email: 'other@test.com',
        role: Role.BUYER,
      };

      await expect(service.findOne('uuid-event-1', otherUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow ADMIN to see any DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      const adminUser: JwtPayload = {
        sub: 'uuid-admin',
        email: 'admin@test.com',
        role: Role.ADMIN,
      };

      const result = await service.findOne('uuid-event-1', adminUser);

      expect(result).toEqual(mockEventDetail);
    });

    it('should throw NotFoundException when unauthenticated user tries to see a DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT

      await expect(service.findOne('uuid-event-1', undefined)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneAdminDetail()', () => {
    it('should allow creator to load their own DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      const creatorUser: JwtPayload = {
        sub: 'uuid-creator-1',
        email: 'creator@test.com',
        role: Role.CREATOR,
      };

      const result = await service.findOneAdminDetail('uuid-event-1', creatorUser);

      expect(result).toEqual(mockEventDetail);
      expect(repo.findById).toHaveBeenCalledWith('uuid-event-1');
    });

    it('should allow ADMIN to load any event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      const result = await service.findOneAdminDetail('uuid-event-1', {
        sub: 'uuid-admin',
        email: 'admin@test.com',
        role: Role.ADMIN,
      });

      expect(result).toEqual(mockEventDetail);
    });

    it('should throw ForbiddenException for non-owner creator', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      const otherCreator: JwtPayload = {
        sub: 'uuid-creator-2',
        email: 'creator2@test.com',
        role: Role.CREATOR,
      };

      await expect(service.findOneAdminDetail('uuid-event-1', otherCreator)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.findOneAdminDetail('uuid-not-found', {
          sub: 'uuid-admin',
          email: 'admin@test.com',
          role: Role.ADMIN,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    const dto: UpdateEventDto = { name: 'Rock en el Foro 2025' };
    const updatedEvent = { ...mockEventDetail, name: 'Rock en el Foro 2025' };

    it('should update event when user is the creator', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
        dto,
      );

      expect(result).toEqual(updatedEvent);
      expect(repo.update).toHaveBeenCalledWith('uuid-event-1', dto);
      expect(cache.del).toHaveBeenCalledWith('events:static:uuid-event-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('uuid-not-found', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // creatorId: uuid-creator-1

      await expect(
        service.update('uuid-event-1', 'uuid-other-user', Role.BUYER, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to update any event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update(
        'uuid-event-1',
        'uuid-admin',
        Role.ADMIN,
        dto,
      );

      expect(result).toEqual(updatedEvent);
    });

    it('should validate venueId exists when venueId is provided', async () => {
      const dtoWithVenue: UpdateEventDto = { venueId: 'uuid-venue-2' };
      repo.findById.mockResolvedValue(mockEventDetail);
      prisma.venue.findUnique.mockResolvedValue(null); // venue not found

      await expect(
        service.update('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dtoWithVenue),
      ).rejects.toThrow(NotFoundException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    // ── sale-started restriction ───────────────────────────────────────────

    it('should throw ForbiddenException when CREATOR edits event with saleStartDate in the past', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      (prisma as any).ticketType.findFirst.mockResolvedValue({ id: 'uuid-tt-1' });

      await expect(
        service.update('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should NOT throw when CREATOR edits event with saleStartDate only in the future', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      (prisma as any).ticketType.findFirst.mockResolvedValue(null); // no past saleStartDate
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(result).toEqual(updatedEvent);
      expect(repo.update).toHaveBeenCalledWith('uuid-event-1', dto);
    });

    it('should NOT throw when event has no ticket types with saleStartDate and CREATOR edits', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      (prisma as any).ticketType.findFirst.mockResolvedValue(null); // no ticket types matched
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(result).toEqual(updatedEvent);
    });

    it('should allow ADMIN to edit event even when saleStartDate is in the past', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      // ticketType.findFirst should NOT be called for ADMIN
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update('uuid-event-1', 'uuid-admin', Role.ADMIN, dto);

      expect(result).toEqual(updatedEvent);
      expect((prisma as any).ticketType.findFirst).not.toHaveBeenCalled();
    });

    // ── CANCELLED status restriction ────────────────────────────────────────

    it('should throw ForbiddenException when CREATOR edits a CANCELLED event', async () => {
      const cancelledEvent = { ...mockEventDetail, status: EventStatus.CANCELLED };
      repo.findById.mockResolvedValue(cancelledEvent);
      (prisma as any).ticketType.findFirst.mockResolvedValue(null);

      await expect(
        service.update('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to edit a CANCELLED event', async () => {
      const cancelledEvent = { ...mockEventDetail, status: EventStatus.CANCELLED };
      repo.findById.mockResolvedValue(cancelledEvent);
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update('uuid-event-1', 'uuid-admin', Role.ADMIN, dto);

      expect(result).toEqual(updatedEvent);
    });
  });

  // ── cancel() ─────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('should cancel the event (set status to CANCELLED)', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      repo.updateStatus.mockResolvedValue({
        ...mockEventDetail,
        status: EventStatus.CANCELLED,
      });

      await service.cancel('uuid-event-1');

      expect(repo.updateStatus).toHaveBeenCalledWith(
        'uuid-event-1',
        EventStatus.CANCELLED,
      );
      expect(cache.del).toHaveBeenCalledWith('events:static:uuid-event-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.cancel('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });

  // ── publish() ─────────────────────────────────────────────────────────────

  describe('publish()', () => {
    const publishedEvent = { ...mockEventDetail, status: EventStatus.PUBLISHED };

    it('should publish a DRAFT event when user is the creator', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      repo.updateStatus.mockResolvedValue(publishedEvent);

      const result = await service.publish(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
      );

      expect(result).toEqual(publishedEvent);
      expect(repo.updateStatus).toHaveBeenCalledWith(
        'uuid-event-1',
        EventStatus.PUBLISHED,
      );
      expect(cache.del).toHaveBeenCalledWith('events:static:uuid-event-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.publish('uuid-not-found', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when event is not in DRAFT status', async () => {
      const alreadyPublished = {
        ...mockEventDetail,
        status: EventStatus.PUBLISHED,
      };
      repo.findById.mockResolvedValue(alreadyPublished);

      await expect(
        service.publish('uuid-event-1', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(ConflictException);
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // creatorId: uuid-creator-1

      await expect(
        service.publish('uuid-event-1', 'uuid-other-user', Role.BUYER),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to publish any DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      repo.updateStatus.mockResolvedValue(publishedEvent);

      const result = await service.publish('uuid-event-1', 'uuid-admin', Role.ADMIN);

      expect(result).toEqual(publishedEvent);
    });
  });

  // ── getUpcoming() ─────────────────────────────────────────────────────────

  describe('getUpcoming()', () => {
    const mockUpcomingRow = {
      id: 'uuid-event-1',
      name: 'Granada Indie Night 2026',
      eventDate: new Date('2026-09-19T21:00:00Z'),
      maxCapacity: 2000,
      venue: { name: 'Palacio de Congresos', city: 'Granada' },
      ticketsSold: 42,
    };

    it('should call findUpcoming with undefined creatorId for ADMIN', async () => {
      const adminUser: JwtPayload = { sub: 'uuid-admin', email: 'admin@test.com', role: Role.ADMIN };
      const query: UpcomingQueryDto = { limit: 5 };
      repo.findUpcoming.mockResolvedValue([mockUpcomingRow]);

      const result = await service.getUpcoming(adminUser, query);

      expect(repo.findUpcoming).toHaveBeenCalledWith(5, undefined);
      expect(result[0].ticketsSold).toBe(42);
      expect(result[0].totalCapacity).toBe(2000);
      expect(cache.getOrSet).toHaveBeenCalled();
    });

    it('should call findUpcoming with creatorId for CREATOR', async () => {
      const creatorUser: JwtPayload = { sub: 'uuid-creator-1', email: 'creator@test.com', role: Role.CREATOR };
      const query: UpcomingQueryDto = { limit: 3 };
      repo.findUpcoming.mockResolvedValue([mockUpcomingRow]);

      await service.getUpcoming(creatorUser, query);

      expect(repo.findUpcoming).toHaveBeenCalledWith(3, 'uuid-creator-1');
    });

    it('should map rows to UpcomingEventResponseDto', async () => {
      const adminUser: JwtPayload = { sub: 'uuid-admin', email: 'admin@test.com', role: Role.ADMIN };
      repo.findUpcoming.mockResolvedValue([mockUpcomingRow]);

      const result = await service.getUpcoming(adminUser, { limit: 5 });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'uuid-event-1',
        name: 'Granada Indie Night 2026',
        venue: { name: 'Palacio de Congresos', city: 'Granada' },
        ticketsSold: 42,
        totalCapacity: 2000,
      });
    });
  });

  // ── getRequiresAttention() ────────────────────────────────────────────────

  describe('getRequiresAttention()', () => {
    const adminUser: JwtPayload = { sub: 'uuid-admin', email: 'admin@test.com', role: Role.ADMIN };
    const creatorUser: JwtPayload = { sub: 'uuid-creator-1', email: 'creator@test.com', role: Role.CREATOR };

    it('should call findRequiresAttention with undefined for ADMIN', async () => {
      repo.findRequiresAttention.mockResolvedValue([]);

      await service.getRequiresAttention(adminUser);

      expect(repo.findRequiresAttention).toHaveBeenCalledWith(undefined);
    });

    it('should call findRequiresAttention with creatorId for CREATOR', async () => {
      repo.findRequiresAttention.mockResolvedValue([]);

      await service.getRequiresAttention(creatorUser);

      expect(repo.findRequiresAttention).toHaveBeenCalledWith('uuid-creator-1');
    });

    it('should detect "Sin imagen" issue', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.DRAFT,
        eventDate: new Date(), imageUrl: null, formatId: 'fmt-1',
        _count: { artists: 1, ticketTypes: 1 }, ticketTypes: [{ availableQuantity: 10 }],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result).toHaveLength(1);
      expect(result[0].issues).toContain('Sin imagen');
    });

    it('should detect "Sin formato" issue', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.DRAFT,
        eventDate: new Date(), imageUrl: 'http://img.com', formatId: null,
        _count: { artists: 1, ticketTypes: 1 }, ticketTypes: [{ availableQuantity: 10 }],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result[0].issues).toContain('Sin formato');
    });

    it('should detect "Sin artistas" issue', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.DRAFT,
        eventDate: new Date(), imageUrl: 'http://img.com', formatId: 'fmt-1',
        _count: { artists: 0, ticketTypes: 1 }, ticketTypes: [{ availableQuantity: 10 }],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result[0].issues).toContain('Sin artistas');
    });

    it('should detect "Sin tipos de entrada" issue', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.DRAFT,
        eventDate: new Date(), imageUrl: 'http://img.com', formatId: 'fmt-1',
        _count: { artists: 1, ticketTypes: 0 }, ticketTypes: [],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result[0].issues).toContain('Sin tipos de entrada');
    });

    it('should detect "Sin entradas disponibles" only for PUBLISHED with 0 available', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.PUBLISHED,
        eventDate: new Date(), imageUrl: 'http://img.com', formatId: 'fmt-1',
        _count: { artists: 1, ticketTypes: 2 },
        ticketTypes: [{ availableQuantity: 0 }, { availableQuantity: 0 }],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result[0].issues).toContain('Sin entradas disponibles');
    });

    it('should NOT add "Sin entradas disponibles" for DRAFT events', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.DRAFT,
        eventDate: new Date(), imageUrl: 'http://img.com', formatId: 'fmt-1',
        _count: { artists: 1, ticketTypes: 1 }, ticketTypes: [{ availableQuantity: 0 }],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      // DRAFT con 0 disponibles no es un issue (aún no está publicado)
      expect(result).toHaveLength(0);
    });

    it('should exclude events with no issues', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.PUBLISHED,
        eventDate: new Date(), imageUrl: 'http://img.com', formatId: 'fmt-1',
        _count: { artists: 2, ticketTypes: 2 }, ticketTypes: [{ availableQuantity: 100 }],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result).toHaveLength(0);
    });

    it('should accumulate multiple issues on same event', async () => {
      repo.findRequiresAttention.mockResolvedValue([{
        id: 'uuid-event-1', name: 'Test', status: EventStatus.DRAFT,
        eventDate: new Date(), imageUrl: null, formatId: null,
        _count: { artists: 0, ticketTypes: 0 }, ticketTypes: [],
      }]);

      const result = await service.getRequiresAttention(adminUser);

      expect(result[0].issues).toHaveLength(4); // Sin imagen, Sin formato, Sin artistas, Sin tipos de entrada
      expect(result[0].issues).toEqual(
        expect.arrayContaining(['Sin imagen', 'Sin formato', 'Sin artistas', 'Sin tipos de entrada']),
      );
    });
  });

  // ── getTopEvents() ────────────────────────────────────────────────────────

  describe('getTopEvents()', () => {
    const mockTopRow = {
      id: 'uuid-event-1',
      name: 'Madrid Rock Fest 2025',
      eventDate: new Date('2025-11-15T20:00:00Z'),
      maxCapacity: 17000,
      venue: { name: 'WiZink Center', city: 'Madrid' },
      ticketsSold: 147,
      revenue: 9185.0,
    };

    it('should delegate to findTopEvents with the given limit', async () => {
      const query: TopEventsQueryDto = { limit: 10 };
      repo.findTopEvents.mockResolvedValue([mockTopRow]);

      const result = await service.getTopEvents(query);

      expect(repo.findTopEvents).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(cache.getOrSet).toHaveBeenCalled();
    });

    it('should map rows to TopEventResponseDto', async () => {
      repo.findTopEvents.mockResolvedValue([mockTopRow]);

      const result = await service.getTopEvents({ limit: 10 });

      expect(result[0]).toMatchObject({
        id: 'uuid-event-1',
        ticketsSold: 147,
        totalCapacity: 17000,
        revenue: 9185.0,
        venue: { name: 'WiZink Center', city: 'Madrid' },
      });
    });

    it('should return empty array when no events have sales', async () => {
      repo.findTopEvents.mockResolvedValue([]);

      const result = await service.getTopEvents({ limit: 10 });

      expect(result).toHaveLength(0);
    });
  });

  // ── getEventMetrics() ─────────────────────────────────────────────────────

  describe('getEventMetrics()', () => {
    const adminUser: JwtPayload = { sub: 'uuid-admin', email: 'admin@test.com', role: Role.ADMIN };
    const creatorUser: JwtPayload = { sub: 'uuid-creator-1', email: 'creator@test.com', role: Role.CREATOR };
    const otherUser: JwtPayload = { sub: 'uuid-other', email: 'other@test.com', role: Role.BUYER };

    const mockMetricsRaw = {
      id: 'uuid-event-1',
      name: 'Granada Indie Night 2025',
      status: EventStatus.FINISHED,
      creatorId: 'uuid-creator-1',
      maxCapacity: 2000,
      ticketTypes: [
        {
          id: 'uuid-tt-1',
          name: 'General',
          totalQuantity: 1200,
          availableQuantity: 0,
          orderItems: [
            { quantity: 4, subtotal: '140.00', order: { status: 'COMPLETED' } },
            { quantity: 2, subtotal: '70.00', order: { status: 'COMPLETED' } },
          ],
        },
        {
          id: 'uuid-tt-2',
          name: 'Preferente',
          totalQuantity: 500,
          availableQuantity: 0,
          orderItems: [
            { quantity: 2, subtotal: '120.00', order: { status: 'COMPLETED' } },
          ],
        },
      ],
      orders: [
        { status: 'COMPLETED' },
        { status: 'COMPLETED' },
        { status: 'COMPLETED' },
        { status: 'PENDING' },
        { status: 'CANCELLED' },
      ],
    };

    it('should return complete metrics for ADMIN', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      expect(result.eventId).toBe('uuid-event-1');
      expect(result.eventName).toBe('Granada Indie Night 2025');
      expect(result.status).toBe(EventStatus.FINISHED);
    });

    it('should allow CREATOR to see their own event metrics', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', creatorUser);

      expect(result.eventId).toBe('uuid-event-1');
    });

    it('should throw ForbiddenException when CREATOR accesses another creator event', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any); // creatorId: uuid-creator-1

      await expect(service.getEventMetrics('uuid-event-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findMetricsById.mockResolvedValue(null);

      await expect(service.getEventMetrics('uuid-not-found', adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate sold tickets correctly', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      // General: 4+2=6, Preferente: 2 → total 8
      expect(result.capacity.sold).toBe(8);
      expect(result.capacity.total).toBe(2000);
      expect(result.capacity.available).toBe(1992);
    });

    it('should calculate occupancyRate correctly', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      // 8 / 2000 = 0.004
      expect(result.capacity.occupancyRate).toBe(0.004);
    });

    it('should calculate revenue per ticket type', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      const general = result.revenue.byTicketType.find((t) => t.name === 'General')!;
      const preferente = result.revenue.byTicketType.find((t) => t.name === 'Preferente')!;

      expect(general.sold).toBe(6);
      expect(general.revenue).toBe(210);
      expect(preferente.sold).toBe(2);
      expect(preferente.revenue).toBe(120);
      expect(result.revenue.total).toBe(330);
    });

    it('should count orders by status', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      expect(result.orders.total).toBe(5);
      expect(result.orders.completed).toBe(3);
      expect(result.orders.pending).toBe(1);
      expect(result.orders.cancelled).toBe(1);
      expect(result.orders.refunded).toBe(0);
    });

    it('should identify the top ticket type by sold count', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      expect(result.topTicketType).toEqual({ name: 'General', sold: 6 });
    });

    it('should return null topTicketType when no tickets have been sold', async () => {
      repo.findMetricsById.mockResolvedValue({
        ...mockMetricsRaw,
        ticketTypes: [
          { id: 'tt-1', name: 'General', totalQuantity: 100, availableQuantity: 100, orderItems: [] },
        ],
        orders: [],
      } as any);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      expect(result.topTicketType).toBeNull();
    });

    it('should include revenueByDate from findRevenueByDate in the response', async () => {
      const revenueByDate: RevenueByDateRow[] = [
        { date: '2026-05-01', revenue: 150 },
        { date: '2026-05-02', revenue: 300 },
      ];
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);
      repo.findRevenueByDate.mockResolvedValue(revenueByDate);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      expect(result.revenueByDate).toEqual(revenueByDate);
      expect(repo.findRevenueByDate).toHaveBeenCalledWith('uuid-event-1');
    });

    it('should include empty revenueByDate array when findRevenueByDate returns empty', async () => {
      repo.findMetricsById.mockResolvedValue(mockMetricsRaw as any);
      repo.findRevenueByDate.mockResolvedValue([]);

      const result = await service.getEventMetrics('uuid-event-1', adminUser);

      expect(result.revenueByDate).toEqual([]);
    });
  });

  // ── findBuyerEvents() — B6: dominantStatus logic ─────────────────────────

  describe('findBuyerEvents() — dominantStatus', () => {
    const futureDate = new Date(Date.now() + 86_400_000 * 30); // 30 days ahead

    const makeTicket = (id: string, eventId: string, status: TicketStatus, eventDate = futureDate) => ({
      id,
      status,
      event: {
        id: eventId,
        name: `Event ${eventId}`,
        eventDate,
        imageUrl: null,
        venue: { id: 'v1', name: 'Venue', city: 'CDMX' },
        format: null,
      },
    });

    it('should compute dominantStatus=ACTIVE when tickets are [ACTIVE, USED]', async () => {
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        makeTicket('t1', 'evt-1', TicketStatus.ACTIVE),
        makeTicket('t2', 'evt-1', TicketStatus.USED),
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].dominantStatus).toBe(TicketStatus.ACTIVE);
    });

    it('should compute dominantStatus=USED when tickets are [USED, CANCELLED]', async () => {
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        makeTicket('t1', 'evt-1', TicketStatus.USED),
        makeTicket('t2', 'evt-1', TicketStatus.CANCELLED),
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data[0].dominantStatus).toBe(TicketStatus.USED);
    });

    it('should compute dominantStatus=CANCELLED when tickets are [CANCELLED, REFUNDED] (same level)', async () => {
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        makeTicket('t1', 'evt-1', TicketStatus.CANCELLED),
        makeTicket('t2', 'evt-1', TicketStatus.REFUNDED),
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      // CANCELLED and REFUNDED are equal priority — dominant is the first encountered at max level
      expect([TicketStatus.CANCELLED, TicketStatus.REFUNDED]).toContain(result.data[0].dominantStatus);
    });

    it('should correctly group tickets from multiple events', async () => {
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        makeTicket('t1', 'evt-A', TicketStatus.ACTIVE),
        makeTicket('t2', 'evt-A', TicketStatus.USED),
        makeTicket('t3', 'evt-B', TicketStatus.CANCELLED),
        makeTicket('t4', 'evt-B', TicketStatus.CANCELLED),
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(2);
      const evtA = result.data.find((d) => d.event.id === 'evt-A')!;
      const evtB = result.data.find((d) => d.event.id === 'evt-B')!;
      expect(evtA.dominantStatus).toBe(TicketStatus.ACTIVE);
      expect(evtA.ticketCount).toBe(2);
      expect(evtB.dominantStatus).toBe(TicketStatus.CANCELLED);
      expect(evtB.ticketCount).toBe(2);
    });
  });

  // ── findBuyerEvents() — B7: grouping + pagination + filtering ────────────

  describe('findBuyerEvents() — grouping, filtering, pagination', () => {
    const makeEvent = (id: string, daysOffset: number) => ({
      id,
      name: `Event ${id}`,
      eventDate: new Date(Date.now() + 86_400_000 * daysOffset),
      imageUrl: null,
      venue: { id: 'v1', name: 'Venue', city: 'CDMX' },
      format: null,
    });

    it('should group 15 tickets from 5 events into 5 groups', async () => {
      const tickets = Array.from({ length: 15 }, (_, i) => ({
        id: `t${i}`,
        status: TicketStatus.ACTIVE,
        event: makeEvent(`evt-${Math.floor(i / 3)}`, 10 + Math.floor(i / 3)),
      }));
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue(tickets);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(5);
      for (const item of result.data) {
        expect(item.ticketCount).toBe(3);
      }
    });

    it('should filter out past events when upcoming=true', async () => {
      const pastDate = new Date(Date.now() - 86_400_000); // yesterday
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        {
          id: 't1',
          status: TicketStatus.ACTIVE,
          event: { id: 'evt-future', name: 'Future', eventDate: new Date(Date.now() + 86_400_000), imageUrl: null, venue: { id: 'v1', name: 'V', city: 'C' }, format: null },
        },
        {
          id: 't2',
          status: TicketStatus.USED,
          event: { id: 'evt-past', name: 'Past', eventDate: pastDate, imageUrl: null, venue: { id: 'v1', name: 'V', city: 'C' }, format: null },
        },
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].event.id).toBe('evt-future');
    });

    it('should return only past events when upcoming=false', async () => {
      const pastDate = new Date(Date.now() - 86_400_000);
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        {
          id: 't1',
          status: TicketStatus.ACTIVE,
          event: { id: 'evt-future', name: 'Future', eventDate: new Date(Date.now() + 86_400_000), imageUrl: null, venue: { id: 'v1', name: 'V', city: 'C' }, format: null },
        },
        {
          id: 't2',
          status: TicketStatus.USED,
          event: { id: 'evt-past', name: 'Past', eventDate: pastDate, imageUrl: null, venue: { id: 'v1', name: 'V', city: 'C' }, format: null },
        },
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: false, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].event.id).toBe('evt-past');
    });

    it('should paginate correctly: page=2, limit=2 over 5 events returns 2 events', async () => {
      const tickets = Array.from({ length: 5 }, (_, i) => ({
        id: `t${i}`,
        status: TicketStatus.ACTIVE,
        event: makeEvent(`evt-${i}`, 10 + i),
      }));
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue(tickets);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 2, limit: 2 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(2);
      // page=2, limit=2 → items at index 2,3 (sorted by eventDate ASC)
      expect(result.data[0].event.id).toBe('evt-2');
      expect(result.data[1].event.id).toBe('evt-3');
    });

    it('should return empty data when buyer has no tickets', async () => {
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should order events by eventDate ASC', async () => {
      ticketsRepo.findByBuyerWithEvents.mockResolvedValue([
        {
          id: 't1',
          status: TicketStatus.ACTIVE,
          event: makeEvent('evt-later', 20),
        },
        {
          id: 't2',
          status: TicketStatus.ACTIVE,
          event: makeEvent('evt-sooner', 5),
        },
      ]);

      const result = await service.findBuyerEvents('buyer-1', { upcoming: true, page: 1, limit: 20 } as BuyerEventsQueryDto);

      expect(result.data[0].event.id).toBe('evt-sooner');
      expect(result.data[1].event.id).toBe('evt-later');
    });
  });
});
