import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArtistRole, Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddEventArtistDto } from './dto';
import { EventArtistsRepository } from './event-artists.repository';
import { EventArtistsService } from './event-artists.service';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockEvent = {
  id: 'uuid-event-1',
  creatorId: 'uuid-creator-1',
};

const mockArtist = { id: 'uuid-artist-1' };

const mockEventArtistRecord = {
  id: 'uuid-ea-1',
  role: ArtistRole.HEADLINER,
  performanceOrder: 1,
  performanceTime: null,
  eventId: 'uuid-event-1',
  artistId: 'uuid-artist-1',
  artist: {
    id: 'uuid-artist-1',
    name: 'Coldplay',
    slug: 'coldplay',
    imageUrl: null,
    country: 'GB',
  },
};

const mockEventArtistBasic = {
  id: 'uuid-ea-1',
  role: ArtistRole.HEADLINER,
  performanceOrder: 1,
  performanceTime: null,
  eventId: 'uuid-event-1',
  artistId: 'uuid-artist-1',
};

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockEventArtistsRepository = {
  findByEventId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaService = {
  event: {
    findUnique: jest.fn(),
  },
  artist: {
    findUnique: jest.fn(),
  },
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('EventArtistsService', () => {
  let service: EventArtistsService;
  let repo: typeof mockEventArtistsRepository;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventArtistsService,
        { provide: EventArtistsRepository, useValue: mockEventArtistsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventArtistsService>(EventArtistsService);
    repo = module.get(EventArtistsRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── add() ─────────────────────────────────────────────────────────────────

  describe('add()', () => {
    const dto: AddEventArtistDto = {
      artistId: 'uuid-artist-1',
      role: ArtistRole.HEADLINER,
      performanceOrder: 1,
    };

    it('should add an artist when user is the creator', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.artist.findUnique.mockResolvedValue(mockArtist);
      repo.create.mockResolvedValue(mockEventArtistRecord);

      const result = await service.add('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-event-1' },
        select: { id: true, creatorId: true },
      });
      expect(prisma.artist.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-artist-1' },
        select: { id: true },
      });
      expect(repo.create).toHaveBeenCalledWith({ ...dto, eventId: 'uuid-event-1' });
      expect(result).toEqual(mockEventArtistRecord);
    });

    it('should add an artist when user is ADMIN', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.artist.findUnique.mockResolvedValue(mockArtist);
      repo.create.mockResolvedValue(mockEventArtistRecord);

      await service.add('uuid-event-1', 'uuid-admin', Role.ADMIN, dto);

      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.add('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.add('uuid-event-1', 'uuid-other', Role.CREATOR, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.artist.findUnique.mockResolvedValue(null);

      await expect(
        service.add('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when artist is already assigned to the event (P2002)', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.artist.findUnique.mockResolvedValue(mockArtist);
      repo.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.add('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(ConflictException);
    });

    it('should re-throw non-P2002 errors', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.artist.findUnique.mockResolvedValue(mockArtist);
      const genericError = new Error('Database error');
      repo.create.mockRejectedValue(genericError);

      await expect(
        service.add('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow('Database error');
    });
  });

  // ── findByEvent() ─────────────────────────────────────────────────────────

  describe('findByEvent()', () => {
    it('should return event artists for an existing event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findByEventId.mockResolvedValue([mockEventArtistRecord]);

      const result = await service.findByEvent('uuid-event-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEventArtistRecord);
      expect(repo.findByEventId).toHaveBeenCalledWith('uuid-event-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findByEvent('uuid-not-found')).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should remove event artist when user is creator and artist belongs to event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(mockEventArtistBasic);
      repo.delete.mockResolvedValue(mockEventArtistBasic);

      await service.remove('uuid-event-1', 'uuid-ea-1', 'uuid-creator-1', Role.CREATOR);

      expect(repo.delete).toHaveBeenCalledWith('uuid-ea-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('uuid-event-1', 'uuid-ea-1', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.remove('uuid-event-1', 'uuid-ea-1', 'uuid-other', Role.CREATOR),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when event artist does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(null);

      await expect(
        service.remove('uuid-event-1', 'uuid-not-found', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when event artist belongs to a different event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue({ ...mockEventArtistBasic, eventId: 'uuid-other-event' });

      await expect(
        service.remove('uuid-event-1', 'uuid-ea-1', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow ADMIN to remove any event artist', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findById.mockResolvedValue(mockEventArtistBasic);
      repo.delete.mockResolvedValue(mockEventArtistBasic);

      await service.remove('uuid-event-1', 'uuid-ea-1', 'uuid-admin', Role.ADMIN);

      expect(repo.delete).toHaveBeenCalledWith('uuid-ea-1');
    });
  });
});
