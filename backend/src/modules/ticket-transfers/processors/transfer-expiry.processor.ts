import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransferStatus } from '../../../generated/prisma/enums';
import { TRANSFER_EXPIRY_QUEUE } from '../../queues/constants/queue-names';
import { TicketTransfersRepository } from '../ticket-transfers.repository';

// ── Job payload ───────────────────────────────────────────────────────────────

interface TransferExpiryJobData {
  transferId: string;
}

// ── Processor ─────────────────────────────────────────────────────────────────

@Processor(TRANSFER_EXPIRY_QUEUE)
export class TransferExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(TransferExpiryProcessor.name);

  constructor(private readonly repository: TicketTransfersRepository) {
    super();
  }

  async process(job: Job<TransferExpiryJobData>): Promise<void> {
    const { transferId } = job.data;

    this.logger.log(`Processing transfer-expiry job ${job.id} — transferId=${transferId}`);

    const transfer = await this.repository.findById(transferId);

    // Idempotent: skip if not found or already in a terminal state
    if (!transfer || transfer.status !== TransferStatus.PENDING) {
      this.logger.log(
        `transfer-expiry: transferId=${transferId} not PENDING (status=${transfer?.status ?? 'not found'}) — skipping`,
      );
      return;
    }

    await this.repository.updateStatus(transfer.id, TransferStatus.EXPIRED);

    this.logger.log(`transfer-expiry: transferId=${transferId} marked EXPIRED`);
  }
}
