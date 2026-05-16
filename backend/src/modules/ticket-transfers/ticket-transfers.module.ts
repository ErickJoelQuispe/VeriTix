import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OptionalJwtAuthGuard } from '@common/guards';
import { PrismaModule } from '../../prisma/prisma.module';
import { TRANSFER_EXPIRY_QUEUE } from '../queues/constants/queue-names';
import { TransferExpiryProcessor } from './processors/transfer-expiry.processor';
import { TicketTransfersController } from './ticket-transfers.controller';
import { TicketTransfersRepository } from './ticket-transfers.repository';
import { TicketTransfersService } from './ticket-transfers.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: TRANSFER_EXPIRY_QUEUE }),
  ],
  controllers: [TicketTransfersController],
  providers: [
    TicketTransfersRepository,
    TicketTransfersService,
    TransferExpiryProcessor,
    OptionalJwtAuthGuard,
  ],
  exports: [TicketTransfersService],
})
export class TicketTransfersModule {}
