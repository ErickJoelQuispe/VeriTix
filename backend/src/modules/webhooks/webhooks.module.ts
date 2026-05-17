import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../prisma/prisma.module';
import { FAVORITE_ALERT_QUEUE, TICKET_EMAIL_QUEUE } from '../queues/constants/queue-names';
import { QueuesModule } from '../queues/queues.module';
import { StripeModule } from '../stripe/stripe.module';
import { TicketsModule } from '../tickets/tickets.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [
    PrismaModule,
    StripeModule,
    TicketsModule,
    QueuesModule,
    BullModule.registerQueue({ name: TICKET_EMAIL_QUEUE }),
    BullModule.registerQueue({ name: FAVORITE_ALERT_QUEUE }),
  ],
  controllers: [WebhooksController],
  providers: [StripeWebhookService],
})
export class WebhooksModule {}
