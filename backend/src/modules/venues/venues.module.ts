import { Module } from '@nestjs/common';
import { AppCacheModule } from '../../cache';
import { VenuesController } from './venues.controller';
import { VenuesRepository } from './venues.repository';
import { VenuesService } from './venues.service';

@Module({
  imports: [AppCacheModule],
  controllers: [VenuesController],
  providers: [VenuesService, VenuesRepository],
  exports: [VenuesService],
})
export class VenuesModule {}
