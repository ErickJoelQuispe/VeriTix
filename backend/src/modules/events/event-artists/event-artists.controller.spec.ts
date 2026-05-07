import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { ArtistRole, Role } from '../../../generated/prisma/enums';
import { AddEventArtistDto } from './dto';
import { EventArtistsController } from './event-artists.controller';
import { EventArtistsService } from './event-artists.service';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockCreatorUser: JwtPayload = {
  sub: 'uuid-creator-1',
  email: 'creator@test.com',
  role: Role.CREATOR,
};

const mockAdminUser: JwtPayload = {
  sub: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockEventArtistResponse = {
  id: 'uuid-ea-1',
  role: ArtistRole.HEADLINER,
  performanceOrder: 1,
  performanceTime: null,
  eventId: 'uuid-event-1',
  artist: {
    id: 'uuid-artist-1',
    name: 'Coldplay',
    slug: 'coldplay',
    imageUrl: null,
    country: 'GB',
  },
};

const mockEventArtistsService = {
  add: jest.fn(),
  findByEvent: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('EventArtistsController', () => {
  let controller: EventArtistsController;
  let service: typeof mockEventArtistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventArtistsController],
      providers: [
        {
          provide: EventArtistsService,
          useValue: mockEventArtistsService,
        },
      ],
    }).compile();

    controller = module.get<EventArtistsController>(EventArtistsController);
    service = module.get(EventArtistsService);

    jest.clearAllMocks();
  });

  // ── add ──────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('should call service.add with eventId, userId, userRole, and dto', async () => {
      const dto: AddEventArtistDto = {
        artistId: 'uuid-artist-1',
        role: ArtistRole.HEADLINER,
        performanceOrder: 1,
      };
      service.add.mockResolvedValue(mockEventArtistResponse);

      const result = await controller.add('uuid-event-1', mockCreatorUser, dto);

      expect(service.add).toHaveBeenCalledTimes(1);
      expect(service.add).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
        dto,
      );
      expect(result).toEqual(mockEventArtistResponse);
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service.findByEvent with eventId', async () => {
      service.findByEvent.mockResolvedValue([mockEventArtistResponse]);

      const result = await controller.findAll('uuid-event-1');

      expect(service.findByEvent).toHaveBeenCalledTimes(1);
      expect(service.findByEvent).toHaveBeenCalledWith('uuid-event-1');
      expect(result).toEqual([mockEventArtistResponse]);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove with eventId, id, userId, userRole', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-event-1', 'uuid-ea-1', mockAdminUser);

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-ea-1',
        'uuid-admin',
        Role.ADMIN,
      );
    });
  });
});
