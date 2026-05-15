import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { NotificationsService } from '../../notifications/notifications.service';
import { FavoritesRepository } from '../favorites.repository';
import { FavoriteAlertProcessor } from './favorite-alert.processor';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockRecipients = [
  { user: { id: 'user-uuid-1', email: 'buyer1@test.com', name: 'Buyer One' } },
  { user: { id: 'user-uuid-2', email: 'buyer2@test.com', name: 'Buyer Two' } },
];

function makeJob(data: { eventId: string; alertType: 'SELLING_OUT' | 'NEW_TICKET_TYPE' }): Job {
  return { id: 'job-uuid-1', data } as Job;
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockFavoritesRepository = {
  findByEventId: jest.fn(),
};

const mockNotificationsService = {
  sendFavoriteAlert: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'FRONTEND_URL') return 'https://veritix.app';
    return undefined;
  }),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FavoriteAlertProcessor', () => {
  let processor: FavoriteAlertProcessor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteAlertProcessor,
        { provide: FavoritesRepository, useValue: mockFavoritesRepository },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    processor = module.get<FavoriteAlertProcessor>(FavoriteAlertProcessor);
  });

  describe('process()', () => {
    it('sends a SELLING_OUT alert email to each user who favorited the event', async () => {
      mockFavoritesRepository.findByEventId.mockResolvedValue(mockRecipients);

      await processor.process(makeJob({ eventId: 'event-uuid-1', alertType: 'SELLING_OUT' }));

      expect(mockFavoritesRepository.findByEventId).toHaveBeenCalledWith('event-uuid-1');
      expect(mockNotificationsService.sendFavoriteAlert).toHaveBeenCalledTimes(2);
      expect(mockNotificationsService.sendFavoriteAlert).toHaveBeenCalledWith({
        to: 'buyer1@test.com',
        userName: 'Buyer One',
        eventName: expect.any(String),
        alertType: 'SELLING_OUT',
        eventUrl: 'https://veritix.app/events/event-uuid-1',
      });
    });

    it('sends a NEW_TICKET_TYPE alert email to each user who favorited the event', async () => {
      mockFavoritesRepository.findByEventId.mockResolvedValue(mockRecipients);

      await processor.process(makeJob({ eventId: 'event-uuid-1', alertType: 'NEW_TICKET_TYPE' }));

      expect(mockNotificationsService.sendFavoriteAlert).toHaveBeenCalledTimes(2);
      expect(mockNotificationsService.sendFavoriteAlert).toHaveBeenCalledWith(
        expect.objectContaining({ alertType: 'NEW_TICKET_TYPE' }),
      );
    });

    it('does not call sendFavoriteAlert when no favorites exist for the event', async () => {
      mockFavoritesRepository.findByEventId.mockResolvedValue([]);

      await processor.process(makeJob({ eventId: 'event-uuid-empty', alertType: 'SELLING_OUT' }));

      expect(mockNotificationsService.sendFavoriteAlert).not.toHaveBeenCalled();
    });

    it('is idempotent — re-executing the same job sends alerts again without error', async () => {
      mockFavoritesRepository.findByEventId.mockResolvedValue([mockRecipients[0]]);
      mockNotificationsService.sendFavoriteAlert.mockResolvedValue(undefined);

      await processor.process(makeJob({ eventId: 'event-uuid-1', alertType: 'SELLING_OUT' }));
      await processor.process(makeJob({ eventId: 'event-uuid-1', alertType: 'SELLING_OUT' }));

      // Each invocation sends alerts independently — 1 recipient × 2 calls = 2
      expect(mockNotificationsService.sendFavoriteAlert).toHaveBeenCalledTimes(2);
    });
  });
});
