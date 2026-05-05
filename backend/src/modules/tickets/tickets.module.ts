import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketPdfService } from '../queues/ticket-pdf.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TicketsController } from './tickets.controller';
import { TicketsGenerator } from './tickets.generator';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository, TicketsGenerator, TicketPdfService],
  exports: [TicketsGenerator],
})
export class TicketsModule {}
