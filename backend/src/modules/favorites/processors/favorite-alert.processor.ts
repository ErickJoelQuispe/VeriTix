import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { NotificationsService } from '../../notifications/notifications.service';
import { FAVORITE_ALERT_QUEUE } from '../../queues/constants/queue-names';
import { FavoritesRepository } from '../favorites.repository';

// ── Job payload ───────────────────────────────────────────────────────────────

interface FavoriteAlertJobData {
  eventId: string;
  alertType: 'SELLING_OUT' | 'NEW_TICKET_TYPE';
}

// ── Processor ─────────────────────────────────────────────────────────────────

@Processor(FAVORITE_ALERT_QUEUE)
export class FavoriteAlertProcessor extends WorkerHost {
  private readonly logger = new Logger(FavoriteAlertProcessor.name);

  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<FavoriteAlertJobData>): Promise<void> {
    const { eventId, alertType } = job.data;

    this.logger.log(
      `Processing favorite-alert job ${job.id} — eventId=${eventId} alertType=${alertType}`,
    );

    const recipients = await this.favoritesRepository.findByEventId(eventId);

    if (recipients.length === 0) {
      this.logger.log(`favorite-alert: No favorites for event ${eventId} — job completed`);
      return;
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? '';
    const eventUrl = `${frontendUrl}/events/${eventId}`;

    for (const { user } of recipients) {
      await this.notificationsService.sendFavoriteAlert({
        to: user.email,
        userName: user.name,
        eventName: eventId, // eventName not in job data; processor uses eventId as fallback
        alertType,
        eventUrl,
      });
    }

    this.logger.log(
      `favorite-alert: Sent ${alertType} alert to ${recipients.length} user(s) for event ${eventId}`,
    );
  }
}
