import { Module } from '@nestjs/common';
import { AppCacheModule } from '../../cache';
import { ArtistsController } from './artists.controller';
import { ArtistsRepository } from './artists.repository';
import { ArtistsService } from './artists.service';

@Module({
  imports: [AppCacheModule],
  controllers: [ArtistsController],
  providers: [ArtistsService, ArtistsRepository],
  exports: [ArtistsService],
})
export class ArtistsModule {}
