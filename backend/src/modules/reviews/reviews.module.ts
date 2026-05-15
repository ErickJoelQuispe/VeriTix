import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventsRepository } from '../events/events.repository';
import { TicketsRepository } from '../tickets/tickets.repository';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsRepository,
    ReviewsService,
    // Direct repository providers (avoid circular module deps — same pattern as FavoritesModule)
    EventsRepository,
    TicketsRepository,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
