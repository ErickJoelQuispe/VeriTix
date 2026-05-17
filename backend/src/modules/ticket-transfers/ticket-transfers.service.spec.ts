import {
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { TransferStatus, TicketStatus, Role } from '../../generated/prisma/enums';
import { JwtPayload } from '@common/interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import { TRANSFER_EXPIRY_QUEUE } from '../queues/constants/queue-names';
import { NotificationsService } from '../notifications/notifications.service';
import { TicketTransfersRepository } from './ticket-transfers.repository';
import { TicketTransfersService } from './ticket-transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CompleteTransferDto } from './dto/complete-transfer.dto';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SENDER_ID = 'sender-uuid-1';
const RECIPIENT_EMAIL = 'recipient@test.com';
const TICKET_ID = 'ticket-uuid-1';
const TRANSFER_ID = 'transfer-uuid-1';
const TOKEN = 'token-uuid-1';

const mockTicket = {
  id: TICKET_ID,
  status: TicketStatus.ACTIVE,
  buyerId: SENDER_ID,
  event: {
    id: 'event-uuid-1',
    name: 'Rock Fest',
    eventDate: new Date('2026-12-31T21:00:00Z'),
  },
};

const mockPendingTransfer = {
  id: TRANSFER_ID,
  ticketId: TICKET_ID,
  senderId: SENDER_ID,
  recipientEmail: RECIPIENT_EMAIL,
  recipientUserId: null,
  token: TOKEN,
  status: TransferStatus.PENDING,
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  ticket: { id: TICKET_ID, status: TicketStatus.ACTIVE, buyerId: SENDER_ID },
  sender: { id: SENDER_ID, name: 'John', lastName: 'Doe', email: 'sender@test.com' },
};

const mockExpiredTransfer = {
  ...mockPendingTransfer,
  status: TransferStatus.EXPIRED,
  expiresAt: new Date(Date.now() - 1000),
};

const mockAcceptedTransfer = {
  ...mockPendingTransfer,
  status: TransferStatus.ACCEPTED,
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByToken: jest.fn(),
  findBySenderId: jest.fn(),
  updateStatus: jest.fn(),
  completeTransfer: jest.fn(),
  findPendingByTicketId: jest.fn(),
};

const mockPrisma = {
  ticket: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

const mockQueue = {
  add: jest.fn(),
};

const mockNotifications = {
  sendTransferInvite: jest.fn(),
};

const mockConfig = {
  get: jest.fn().mockReturnValue('https://veritix.io'),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TicketTransfersService', () => {
  let service: TicketTransfersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketTransfersService,
        { provide: TicketTransfersRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken(TRANSFER_EXPIRY_QUEUE), useValue: mockQueue },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<TicketTransfersService>(TicketTransfersService);
  });

  // ── initiate ───────────────────────────────────────────────────────────────

  describe('initiate()', () => {
    const dto: CreateTransferDto = { ticketId: TICKET_ID, recipientEmail: RECIPIENT_EMAIL };

    it('creates a transfer when ticket is ACTIVE and caller is the owner', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      mockRepo.findPendingByTicketId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockPendingTransfer);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'recipient-uuid', email: RECIPIENT_EMAIL });
      mockQueue.add.mockResolvedValue({ id: 'job-1' });
      mockNotifications.sendTransferInvite.mockResolvedValue(undefined);

      const result = await service.initiate(SENDER_ID, dto);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ticketId: TICKET_ID, senderId: SENDER_ID, recipientEmail: RECIPIENT_EMAIL }),
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'expire',
        { transferId: TRANSFER_ID },
        expect.objectContaining({ delay: 48 * 60 * 60 * 1000 }),
      );
      expect(mockNotifications.sendTransferInvite).toHaveBeenCalledWith(
        expect.objectContaining({ to: RECIPIENT_EMAIL, isNewUser: false }),
      );
      expect(result).toEqual(mockPendingTransfer);
    });

    it('sends isNewUser=true when recipient email is not a registered user', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      mockRepo.findPendingByTicketId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockPendingTransfer);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockQueue.add.mockResolvedValue({ id: 'job-1' });
      mockNotifications.sendTransferInvite.mockResolvedValue(undefined);

      await service.initiate(SENDER_ID, dto);

      expect(mockNotifications.sendTransferInvite).toHaveBeenCalledWith(
        expect.objectContaining({ isNewUser: true }),
      );
    });

    it('throws NotFoundException when ticket does not exist', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.initiate(SENDER_ID, dto)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when caller is not the ticket owner', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ ...mockTicket, buyerId: 'other-user-uuid' });

      await expect(service.initiate(SENDER_ID, dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws UnprocessableEntityException when ticket status is USED', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ ...mockTicket, status: TicketStatus.USED });

      await expect(service.initiate(SENDER_ID, dto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws ConflictException when a PENDING transfer already exists for the ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);
      mockRepo.findPendingByTicketId.mockResolvedValue(mockPendingTransfer);

      await expect(service.initiate(SENDER_ID, dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── accept ─────────────────────────────────────────────────────────────────

  describe('accept()', () => {
    const callerUser: JwtPayload = { sub: 'recipient-uuid', email: RECIPIENT_EMAIL, role: Role.BUYER };

    it('completes transfer and returns { accepted: true, ticketId } when authenticated user matches', async () => {
      mockRepo.findByToken.mockResolvedValue(mockPendingTransfer);
      mockRepo.completeTransfer.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.ACCEPTED });

      const result = await service.accept(TOKEN, callerUser);

      expect(mockRepo.completeTransfer).toHaveBeenCalledWith(TRANSFER_ID, 'recipient-uuid');
      expect(result).toEqual({ accepted: true, ticketId: TICKET_ID });
    });

    it('returns { requiresRegistration: true } when no user is authenticated', async () => {
      mockRepo.findByToken.mockResolvedValue(mockPendingTransfer);

      const result = await service.accept(TOKEN, undefined);

      expect(mockRepo.completeTransfer).not.toHaveBeenCalled();
      expect(result).toEqual({
        requiresRegistration: true,
        transferToken: TOKEN,
        recipientEmail: RECIPIENT_EMAIL,
      });
    });

    it('throws ForbiddenException when authenticated user email does not match recipientEmail', async () => {
      mockRepo.findByToken.mockResolvedValue(mockPendingTransfer);
      const wrongUser: JwtPayload = { sub: 'other-uuid', email: 'other@test.com', role: Role.BUYER };

      await expect(service.accept(TOKEN, wrongUser)).rejects.toThrow(ForbiddenException);
    });

    it('throws GoneException when transfer is already EXPIRED', async () => {
      mockRepo.findByToken.mockResolvedValue(mockExpiredTransfer);

      await expect(service.accept(TOKEN, callerUser)).rejects.toThrow(GoneException);
    });

    it('throws ConflictException when transfer status is ACCEPTED (not PENDING)', async () => {
      mockRepo.findByToken.mockResolvedValue(mockAcceptedTransfer);

      await expect(service.accept(TOKEN, callerUser)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when token does not exist', async () => {
      mockRepo.findByToken.mockResolvedValue(null);

      await expect(service.accept('bad-token', callerUser)).rejects.toThrow(NotFoundException);
    });

    it('marks transfer as EXPIRED and throws GoneException when expiresAt is in the past but status is still PENDING', async () => {
      const expiredPendingTransfer = {
        ...mockPendingTransfer,
        status: TransferStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000),
      };
      mockRepo.findByToken.mockResolvedValue(expiredPendingTransfer);
      mockRepo.updateStatus.mockResolvedValue({ ...expiredPendingTransfer, status: TransferStatus.EXPIRED });

      await expect(service.accept(TOKEN, callerUser)).rejects.toThrow(GoneException);
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(TRANSFER_ID, TransferStatus.EXPIRED);
    });
  });

  // ── cancel ─────────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cancels transfer when caller is the sender', async () => {
      mockRepo.findById.mockResolvedValue(mockPendingTransfer);
      mockRepo.updateStatus.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.CANCELLED });

      await service.cancel(TRANSFER_ID, SENDER_ID, Role.BUYER);

      expect(mockRepo.updateStatus).toHaveBeenCalledWith(TRANSFER_ID, TransferStatus.CANCELLED);
    });

    it('cancels transfer when caller is ADMIN (even if not sender)', async () => {
      mockRepo.findById.mockResolvedValue(mockPendingTransfer);
      mockRepo.updateStatus.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.CANCELLED });

      await service.cancel(TRANSFER_ID, 'admin-uuid', Role.ADMIN);

      expect(mockRepo.updateStatus).toHaveBeenCalledWith(TRANSFER_ID, TransferStatus.CANCELLED);
    });

    it('throws ForbiddenException when caller is not sender and not ADMIN', async () => {
      mockRepo.findById.mockResolvedValue(mockPendingTransfer);

      await expect(service.cancel(TRANSFER_ID, 'other-uuid', Role.BUYER)).rejects.toThrow(ForbiddenException);
    });

    it('throws UnprocessableEntityException when transfer status is not PENDING', async () => {
      mockRepo.findById.mockResolvedValue(mockAcceptedTransfer);

      await expect(service.cancel(TRANSFER_ID, SENDER_ID, Role.BUYER)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('throws NotFoundException when transfer does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.cancel('bad-id', SENDER_ID, Role.BUYER)).rejects.toThrow(NotFoundException);
    });
  });

  // ── completeAfterRegister ──────────────────────────────────────────────────

  describe('completeAfterRegister()', () => {
    const newUser: JwtPayload = { sub: 'new-user-uuid', email: RECIPIENT_EMAIL, role: Role.BUYER };
    const dto: CompleteTransferDto = { transferToken: TOKEN };

    it('completes transfer when email matches the recipient', async () => {
      mockRepo.findByToken.mockResolvedValue(mockPendingTransfer);
      mockRepo.completeTransfer.mockResolvedValue({ ...mockPendingTransfer, status: TransferStatus.ACCEPTED });

      const result = await service.completeAfterRegister(newUser, dto);

      expect(mockRepo.completeTransfer).toHaveBeenCalledWith(TRANSFER_ID, 'new-user-uuid');
      expect(result).toEqual({ accepted: true, ticketId: TICKET_ID });
    });

    it('throws ForbiddenException when caller email does not match recipient email', async () => {
      mockRepo.findByToken.mockResolvedValue(mockPendingTransfer);
      const wrongUser: JwtPayload = { sub: 'wrong-uuid', email: 'wrong@test.com', role: Role.BUYER };

      await expect(service.completeAfterRegister(wrongUser, dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws GoneException when transfer is EXPIRED', async () => {
      mockRepo.findByToken.mockResolvedValue(mockExpiredTransfer);

      await expect(service.completeAfterRegister(newUser, dto)).rejects.toThrow(GoneException);
    });

    it('throws ConflictException when transfer is not PENDING', async () => {
      mockRepo.findByToken.mockResolvedValue(mockAcceptedTransfer);

      await expect(service.completeAfterRegister(newUser, dto)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when token does not exist', async () => {
      mockRepo.findByToken.mockResolvedValue(null);

      await expect(service.completeAfterRegister(newUser, { transferToken: 'bad-token' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
