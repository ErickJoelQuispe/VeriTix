import { Module } from '@nestjs/common';
import { AppCacheModule } from '../../cache';
import { GenresController } from './genres.controller';
import { GenresRepository } from './genres.repository';
import { GenresService } from './genres.service';

@Module({
  imports: [AppCacheModule],
  controllers: [GenresController],
  providers: [GenresService, GenresRepository],
  exports: [GenresService],
})
export class GenresModule {}
