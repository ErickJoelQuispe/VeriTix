import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppCacheModule } from './cache';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ArtistsModule } from './modules/artists/artists.module';
import { ConcertFormatsModule } from './modules/concert-formats/concert-formats.module';
import { GenresModule } from './modules/genres/genres.module';
import { VenuesModule } from './modules/venues/venues.module';
import { EventsModule } from './modules/events/events.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QueuesModule } from './modules/queues/queues.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TicketTransfersModule } from './modules/ticket-transfers/ticket-transfers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('NODE_ENV') !== 'production' ? 'debug' : 'info',
          transport:
            config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty' }
              : undefined,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    AppCacheModule,
    PrismaModule,
    NotificationsModule,
    QueuesModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    EventsModule,
    OrdersModule,
    TicketsModule,
    WebhooksModule,
    GenresModule,
    ConcertFormatsModule,
    ArtistsModule,
    UploadsModule,
    FavoritesModule,
    ReviewsModule,
    TicketTransfersModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
