import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppCacheModule } from '../../cache';
import { PrismaModule } from '../../prisma/prisma.module';
import { FAVORITE_ALERT_QUEUE } from '../queues/constants/queue-names';
import { ReviewsModule } from '../reviews/reviews.module';
import { TicketsModule } from '../tickets/tickets.module';
import { EventArtistsController } from './event-artists/event-artists.controller';
import { EventArtistsRepository } from './event-artists/event-artists.repository';
import { EventArtistsService } from './event-artists/event-artists.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { TicketTypesController } from './ticket-types/ticket-types.controller';
import { TicketTypesRepository } from './ticket-types/ticket-types.repository';
import { TicketTypesService } from './ticket-types/ticket-types.service';

@Module({
  imports: [
    PrismaModule,
    AppCacheModule,
    BullModule.registerQueue({ name: FAVORITE_ALERT_QUEUE }),
    ReviewsModule,
    TicketsModule,
  ],
  controllers: [EventsController, TicketTypesController, EventArtistsController],
  providers: [
    EventsService,
    EventsRepository,
    TicketTypesService,
    TicketTypesRepository,
    EventArtistsService,
    EventArtistsRepository,
  ],
  exports: [EventsService],
})
export class EventsModule {}
