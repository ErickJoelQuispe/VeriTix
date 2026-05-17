import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventsRepository } from '../events/events.repository';
import { FAVORITE_ALERT_QUEUE } from '../queues/constants/queue-names';
import { FavoritesController } from './favorites.controller';
import { FavoritesRepository } from './favorites.repository';
import { FavoritesService } from './favorites.service';
import { FavoriteAlertProcessor } from './processors/favorite-alert.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: FAVORITE_ALERT_QUEUE }),
  ],
  controllers: [FavoritesController],
  providers: [
    FavoritesRepository,
    FavoritesService,
    FavoriteAlertProcessor,
    // EventsRepository needed by FavoritesService for event existence check
    EventsRepository,
  ],
  exports: [FavoritesService],
})
export class FavoritesModule {}
