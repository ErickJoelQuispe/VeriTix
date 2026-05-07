import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(@InjectQueue('event-reminders') private readonly remindersQueue: Queue) {}

  async scheduleReminders(
    orderId: string,
    buyerEmail: string,
    buyerName: string,
    eventName: string,
    eventDate: Date,
    venueName: string,
  ): Promise<void> {
    const now = Date.now();
    const eventTime = eventDate.getTime();

    const reminders = [
      { daysLeft: 7, delay: eventTime - 7 * 24 * 60 * 60 * 1000 - now },
      { daysLeft: 1, delay: eventTime - 1 * 24 * 60 * 60 * 1000 - now },
    ];

    for (const { daysLeft, delay } of reminders) {
      if (delay <= 0) {
        this.logger.debug(
          `Skipping ${daysLeft}-day reminder for order ${orderId} — event is too close`,
        );
        continue;
      }

      await this.remindersQueue.add(
        'send-reminder',
        { orderId, buyerEmail, buyerName, eventName, eventDate, venueName, daysLeft },
        { delay, jobId: `reminder-${orderId}-${daysLeft}d` },
      );

      this.logger.debug(
        `Scheduled ${daysLeft}-day reminder for order ${orderId} (delay: ${delay}ms)`,
      );
    }
  }
}
