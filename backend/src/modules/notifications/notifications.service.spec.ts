import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';

const mockResendSend = jest.fn().mockResolvedValue({ id: 'email-id-123' });

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    mockResendSend.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                RESEND_API_KEY: 'test-api-key',
                EMAIL_FROM: 'noreply@veritix.com',
                FRONTEND_URL: 'https://veritix.com',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    service.onModuleInit();
  });

  describe('sendFavoriteAlert', () => {
    it('sends an email to the recipient', async () => {
      await service.sendFavoriteAlert({
        to: 'buyer@example.com',
        userName: 'Alice',
        eventName: 'Rock Festival 2026',
        alertType: 'SELLING_OUT',
        eventUrl: 'https://veritix.com/events/1',
      });

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'buyer@example.com',
          from: 'noreply@veritix.com',
        }),
      );
    });

    it('sends email with event name in subject for SELLING_OUT', async () => {
      await service.sendFavoriteAlert({
        to: 'buyer@example.com',
        userName: 'Alice',
        eventName: 'Rock Festival 2026',
        alertType: 'SELLING_OUT',
        eventUrl: 'https://veritix.com/events/1',
      });

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.subject).toContain('Rock Festival 2026');
    });

    it('sends email with event name in subject for NEW_TICKET_TYPE', async () => {
      await service.sendFavoriteAlert({
        to: 'buyer@example.com',
        userName: 'Bob',
        eventName: 'Jazz Night',
        alertType: 'NEW_TICKET_TYPE',
        eventUrl: 'https://veritix.com/events/2',
      });

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.subject).toContain('Jazz Night');
    });

    it('does not throw when Resend fails (swallows error gracefully)', async () => {
      mockResendSend.mockRejectedValueOnce(new Error('Resend API error'));

      await expect(
        service.sendFavoriteAlert({
          to: 'buyer@example.com',
          userName: 'Alice',
          eventName: 'Rock Festival 2026',
          alertType: 'SELLING_OUT',
          eventUrl: 'https://veritix.com/events/1',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendTransferInvite', () => {
    it('sends an email to the recipient', async () => {
      await service.sendTransferInvite({
        to: 'recipient@example.com',
        senderName: 'Bob',
        eventName: 'Summer Jam 2026',
        eventDate: 'July 12, 2026',
        acceptUrl: 'https://veritix.com/ticket-transfers/accept?token=abc',
        isNewUser: false,
      });

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          from: 'noreply@veritix.com',
        }),
      );
    });

    it('sends email with event name in subject', async () => {
      await service.sendTransferInvite({
        to: 'recipient@example.com',
        senderName: 'Bob',
        eventName: 'Summer Jam 2026',
        eventDate: 'July 12, 2026',
        acceptUrl: 'https://veritix.com/ticket-transfers/accept?token=abc',
        isNewUser: false,
      });

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.subject).toContain('Summer Jam 2026');
    });

    it('does not throw when Resend fails (swallows error gracefully)', async () => {
      mockResendSend.mockRejectedValueOnce(new Error('Resend API error'));

      await expect(
        service.sendTransferInvite({
          to: 'recipient@example.com',
          senderName: 'Bob',
          eventName: 'Summer Jam 2026',
          eventDate: 'July 12, 2026',
          acceptUrl: 'https://veritix.com/ticket-transfers/accept?token=abc',
          isNewUser: true,
        }),
      ).resolves.toBeUndefined();
    });
  });
});
