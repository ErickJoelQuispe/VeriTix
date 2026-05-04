import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDecipheriv } from 'node:crypto';
import { PaginatedResponse } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import { Role, TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TicketDetailResponseDto,
  TicketListResponseDto,
  ValidateTicketResponseDto,
} from './dto';
import { TicketDetail, TicketListItem, TicketsRepository } from './tickets.repository';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toListResponse(ticket: TicketListItem): TicketListResponseDto {
  return {
    id: ticket.id,
    hash: ticket.hash,
    status: ticket.status,
    purchaseDate: ticket.purchaseDate,
    ticketType: {
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
    },
    event: ticket.event,
    orderItem: ticket.orderItem,
  };
}

function toDetailResponse(ticket: TicketDetail): TicketDetailResponseDto {
  return {
    id: ticket.id,
    hash: ticket.hash,
    qrPayload: ticket.qrPayload,
    status: ticket.status,
    purchaseDate: ticket.purchaseDate,
    validatedAt: ticket.validatedAt,
    createdAt: ticket.createdAt,
    ticketType: {
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
    },
    event: ticket.event,
    orderItem: ticket.orderItem,
    order: {
      id: ticket.order.id,
      totalAmount: Number(ticket.order.totalAmount),
    },
    validatedBy: ticket.validatedBy,
  };
}

// ── Crypto ────────────────────────────────────────────────────────────────────

function decryptPayload(payload: string, secret: string): string {
  const [ivHex, authTagHex, encryptedHex] = payload.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new BadRequestException('Payload de ticket inválido');
  }

  const key = Buffer.from(secret, 'utf8');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    throw new BadRequestException('Payload de ticket inválido o manipulado');
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class TicketsService {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ── getMyTickets ─────────────────────────────────────────────────────────
  // Buyer ve sus tickets con qrPayload incluido

  async getMyTickets(
    buyerId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TicketDetailResponseDto>> {
    const result = await this.ticketsRepository.findByBuyer(buyerId, page, limit);

    return {
      data: result.data.map(toDetailResponse),
      meta: result.meta,
    };
  }

  // ── getEventTickets ──────────────────────────────────────────────────────
  // CREATOR: solo su evento. ADMIN: cualquier evento.
  // SIN qrPayload — el staff no necesita el código QR

  async getEventTickets(
    eventId: string,
    user: JwtPayload,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TicketListResponseDto>> {
    // Verificar que el evento existe y validar ownership para CREATOR
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) throw new NotFoundException('Evento no encontrado');

    if (
      user.role !== Role.ADMIN &&
      event.creatorId !== user.sub
    ) {
      throw new ForbiddenException(
        'No tenés permiso para ver los tickets de este evento',
      );
    }

    const result = await this.ticketsRepository.findByEvent(eventId, page, limit);

    return {
      data: result.data.map(toListResponse),
      meta: result.meta,
    };
  }

  // ── findOne ──────────────────────────────────────────────────────────────
  // Buyer ve solo el suyo. ADMIN ve cualquiera. CON qrPayload.

  async findOne(
    id: string,
    user: JwtPayload,
  ): Promise<TicketDetailResponseDto> {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (ticket.buyerId !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'No tenés permiso para ver este ticket',
      );
    }

    return toDetailResponse(ticket);
  }

  // ── validateTicket ───────────────────────────────────────────────────────
  // Valida un ticket por payload cifrado AES-256-GCM. Solo VALIDATOR y ADMIN.
  // Descifra el payload para obtener el hash, luego valida.

  async validateTicket(
    payload: string,
    validatorId: string,
  ): Promise<ValidateTicketResponseDto> {
    const secret = this.config.getOrThrow<string>('AES_SECRET_KEY');
    const hash = decryptPayload(payload, secret);
    const ticket = await this.ticketsRepository.findByHash(hash);

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    // Validar estado con mensajes específicos
    if (ticket.status !== TicketStatus.ACTIVE) {
      const messages: Record<string, string> = {
        [TicketStatus.USED]:      'Este ticket ya fue utilizado',
        [TicketStatus.CANCELLED]: 'Este ticket fue cancelado',
        [TicketStatus.REFUNDED]:  'Este ticket fue reembolsado',
      };
      throw new ConflictException(
        messages[ticket.status] ?? 'Este ticket no es válido',
      );
    }

    // Marcar como USED con el validador
    const updated = await this.ticketsRepository.updateStatus(
      ticket.id,
      TicketStatus.USED,
      validatorId,
    );

    // Cargar el nombre del buyer para la respuesta
    const buyer = await this.prisma.user.findUniqueOrThrow({
      where: { id: ticket.buyerId ?? '' },
      select: { name: true, lastName: true },
    });

    return {
      ticketId: updated.id,
      eventName: updated.event.name,
      ticketTypeName: updated.ticketType.name,
      buyerName: `${buyer.name} ${buyer.lastName}`,
      validatedAt: updated.validatedAt!,
    };
  }
}
