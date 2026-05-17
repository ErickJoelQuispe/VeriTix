import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketPdfService } from '../queues/ticket-pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccessStatsService } from './access-stats.service';
import { TicketsController } from './tickets.controller';
import { TicketsGenerator } from './tickets.generator';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository, TicketsGenerator, TicketPdfService, AccessStatsService],
  exports: [TicketsGenerator, AccessStatsService, TicketsRepository],
})
export class TicketsModule {}
