import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TicketsModule } from '../tickets/tickets.module';
import { EventsRepository } from '../events/events.repository';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PrismaModule, TicketsModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsRepository,
    ReviewsService,
    EventsRepository,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
