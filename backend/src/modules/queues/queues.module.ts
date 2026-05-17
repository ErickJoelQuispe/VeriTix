import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EVENT_REMINDERS_QUEUE, FAVORITE_ALERT_QUEUE, TICKET_EMAIL_QUEUE, TRANSFER_EXPIRY_QUEUE } from './constants/queue-names';
import { ReminderProcessor } from './reminder.processor';
import { ReminderScheduler } from './reminder.scheduler';
import { TicketEmailProcessor } from './ticket-email.processor';
import { TicketPdfService } from './ticket-pdf.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({ name: EVENT_REMINDERS_QUEUE }),
    BullModule.registerQueue({ name: TICKET_EMAIL_QUEUE }),
    BullModule.registerQueue({ name: FAVORITE_ALERT_QUEUE }),
    BullModule.registerQueue({ name: TRANSFER_EXPIRY_QUEUE }),
  ],
  providers: [ReminderScheduler, ReminderProcessor, TicketPdfService, TicketEmailProcessor],
  exports: [ReminderScheduler],
})
export class QueuesModule {}
