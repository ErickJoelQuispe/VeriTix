import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { TicketStatus, TransferStatus } from '../../generated/prisma/enums';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '@common/interfaces';
import { TRANSFER_EXPIRY_QUEUE } from '../queues/constants/queue-names';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CompleteTransferDto } from './dto/complete-transfer.dto';
import { TicketTransferRecord, TicketTransfersRepository } from './ticket-transfers.repository';

// ── Return types ──────────────────────────────────────────────────────────────

type AcceptResult =
  | { accepted: true; ticketId: string }
  | { requiresRegistration: true; transferToken: string; recipientEmail: string };

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class TicketTransfersService {
  constructor(
    private readonly repository: TicketTransfersRepository,
    private readonly prisma: PrismaService,
    @InjectQueue(TRANSFER_EXPIRY_QUEUE) private readonly transferExpiryQueue: Queue,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Initiate a ticket transfer.
   * Validates ownership, ticket status, and no existing PENDING transfer.
   * Enqueues a 48h expiry job and sends an invite email.
   */
  async initiate(senderId: string, dto: CreateTransferDto): Promise<TicketTransferRecord> {
    // 1. Find ticket
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      include: { event: { select: { id: true, name: true, eventDate: true } } },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // 2. Verify ownership
    if (ticket.buyerId !== senderId) {
      throw new ForbiddenException('You do not own this ticket');
    }

    // 3. Verify ticket is transferable
    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new UnprocessableEntityException('Ticket is not transferable');
    }

    // 4. Check for existing PENDING transfer
    const existingTransfer = await this.repository.findPendingByTicketId(dto.ticketId);
    if (existingTransfer) {
      throw new ConflictException('A transfer is already pending for this ticket');
    }

    // 5. Set expiry
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // 6. Create transfer
    const transfer = await this.repository.create({
      ticketId: dto.ticketId,
      senderId,
      recipientEmail: dto.recipientEmail,
      expiresAt,
    });

    // 7. Check if recipient is an existing user
    const recipientUser = await this.prisma.user.findUnique({
      where: { email: dto.recipientEmail },
    });
    const isNewUser = recipientUser === null;

    // 8. Enqueue expiry job
    await this.transferExpiryQueue.add(
      'expire',
      { transferId: transfer.id },
      { delay: 48 * 60 * 60 * 1000 },
    );

    // 9 & 10. Build accept URL and send email
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? '';
    const acceptUrl = isNewUser
      ? `${frontendUrl}/register?transferToken=${transfer.token}`
      : `${frontendUrl}/ticket-transfers/accept?token=${transfer.token}`;

    // Re-fetch sender name from prisma since ticket include doesn't have buyer
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    await this.notificationsService.sendTransferInvite({
      to: dto.recipientEmail,
      senderName: sender?.name ?? 'Someone',
      eventName: ticket.event.name,
      eventDate: ticket.event.eventDate.toISOString(),
      acceptUrl,
      isNewUser,
    });

    return transfer;
  }

  /**
   * Accept a transfer via its token.
   * If authenticated and email matches → complete transfer.
   * If not authenticated → return requiresRegistration signal.
   */
  async accept(token: string, callerUser?: JwtPayload): Promise<AcceptResult> {
    // 1. Find transfer by token
    const transfer = await this.repository.findByToken(token);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    // 2. Already expired
    if (transfer.status === TransferStatus.EXPIRED) {
      throw new GoneException('Transfer has expired');
    }

    // 3. Not pending
    if (transfer.status !== TransferStatus.PENDING) {
      throw new ConflictException('Transfer is no longer pending');
    }

    // 4. Check wall-clock expiry even if status is still PENDING
    if (transfer.expiresAt <= new Date()) {
      await this.repository.updateStatus(transfer.id, TransferStatus.EXPIRED);
      throw new GoneException('Transfer has expired');
    }

    // 5. Authenticated user
    if (callerUser) {
      if (callerUser.email !== transfer.recipientEmail) {
        throw new ForbiddenException('This transfer is not addressed to you');
      }
      await this.repository.completeTransfer(transfer.id, callerUser.sub);
      return { accepted: true, ticketId: transfer.ticketId };
    }

    // 6. Unauthenticated → signal registration required
    return {
      requiresRegistration: true,
      transferToken: token,
      recipientEmail: transfer.recipientEmail,
    };
  }

  /**
   * Cancel a pending transfer.
   * Only the sender or an ADMIN can cancel.
   */
  async cancel(transferId: string, callerId: string, callerRole: Role): Promise<void> {
    const transfer = await this.repository.findById(transferId);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.senderId !== callerId && callerRole !== Role.ADMIN) {
      throw new ForbiddenException('You cannot cancel this transfer');
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new UnprocessableEntityException('Transfer cannot be cancelled in its current state');
    }

    await this.repository.updateStatus(transferId, TransferStatus.CANCELLED);
  }

  /**
   * Complete a transfer after the recipient registers.
   * Called by a freshly registered user who holds a transferToken.
   */
  async completeAfterRegister(
    callerUser: JwtPayload,
    dto: CompleteTransferDto,
  ): Promise<{ accepted: true; ticketId: string }> {
    const transfer = await this.repository.findByToken(dto.transferToken);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.status === TransferStatus.EXPIRED) {
      throw new GoneException('Transfer has expired');
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new ConflictException('Transfer is no longer pending');
    }

    if (callerUser.email !== transfer.recipientEmail) {
      throw new ForbiddenException('This transfer is not addressed to you');
    }

    await this.repository.completeTransfer(transfer.id, callerUser.sub);
    return { accepted: true, ticketId: transfer.ticketId };
  }
}
