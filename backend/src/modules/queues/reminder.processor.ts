import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from '../notifications/notifications.service';

interface ReminderJobData {
  orderId: string;
  buyerEmail: string;
  buyerName: string;
  eventName: string;
  eventDate: Date;
  venueName: string;
  daysLeft: number;
}

@Processor('event-reminders')
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<ReminderJobData>): Promise<void> {
    if (job.name !== 'send-reminder') return;

    const { buyerEmail, buyerName, eventName, eventDate, venueName, daysLeft } = job.data;

    this.logger.debug(`Processing reminder job ${job.id} — ${daysLeft}d before "${eventName}"`);

    await this.notificationsService.sendEventReminder(
      buyerEmail,
      buyerName,
      eventName,
      new Date(eventDate),
      venueName,
      daysLeft,
    );
  }
}
