import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { TransferStatus, TicketStatus } from '../../../generated/prisma/enums';
import { TicketTransfersRepository } from '../ticket-transfers.repository';
import { TransferExpiryProcessor } from './transfer-expiry.processor';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TRANSFER_ID = 'transfer-uuid-1';

const mockPendingTransfer = {
  id: TRANSFER_ID,
  ticketId: 'ticket-uuid-1',
  senderId: 'sender-uuid-1',
  recipientEmail: 'recipient@test.com',
  recipientUserId: null,
  token: 'token-uuid-1',
  status: TransferStatus.PENDING,
  expiresAt: new Date(Date.now() + 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  ticket: { id: 'ticket-uuid-1', status: TicketStatus.ACTIVE, buyerId: 'sender-uuid-1' },
  sender: { id: 'sender-uuid-1', name: 'John', lastName: 'Doe', email: 'sender@test.com' },
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRepo = {
  findById: jest.fn(),
  updateStatus: jest.fn(),
};

function makeJob(transferId: string): Job<{ transferId: string }> {
  return { id: 'job-1', data: { transferId } } as unknown as Job<{ transferId: string }>;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TransferExpiryProcessor', () => {
  let processor: TransferExpiryProcessor;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferExpiryProcessor,
        { provide: TicketTransfersRepository, useValue: mockRepo },
      ],
    }).compile();

    processor = module.get<TransferExpiryProcessor>(TransferExpiryProcessor);
  });

  it('marks transfer as EXPIRED when status is PENDING', async () => {
    mockRepo.findById.mockResolvedValue(mockPendingTransfer);
    mockRepo.updateStatus.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.EXPIRED });

    await processor.process(makeJob(TRANSFER_ID));

    expect(mockRepo.updateStatus).toHaveBeenCalledWith(TRANSFER_ID, TransferStatus.EXPIRED);
  });

  it('does nothing (no-op) when transfer status is ACCEPTED', async () => {
    mockRepo.findById.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.ACCEPTED });

    await processor.process(makeJob(TRANSFER_ID));

    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('does nothing (no-op) when transfer status is CANCELLED', async () => {
    mockRepo.findById.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.CANCELLED });

    await processor.process(makeJob(TRANSFER_ID));

    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('does nothing (no-op) when transfer is not found — does not throw', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(processor.process(makeJob('nonexistent-id'))).resolves.toBeUndefined();
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
  });
});
