import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

// ── Select constants ──────────────────────────────────────────────────────────

export const TICKET_LIST_SELECT = {
  id: true,
  hash: true,
  status: true,
  purchaseDate: true,
  ticketType: {
    select: {
      name: true,
      price: true,
    },
  },
  event: {
    select: {
      id: true,
      name: true,
      eventDate: true,
    },
  },
  orderItem: {
    select: { id: true },
  },
} as const;

export const TICKET_DETAIL_SELECT = {
  id: true,
  hash: true,
  qrPayload: true,
  status: true,
  purchaseDate: true,
  validatedAt: true,
  createdAt: true,
  buyerId: true,
  ticketType: {
    select: {
      name: true,
      price: true,
    },
  },
  event: {
    select: {
      id: true,
      name: true,
      eventDate: true,
    },
  },
  orderItem: {
    select: { id: true },
  },
  order: {
    select: {
      id: true,
      totalAmount: true,
    },
  },
  validatedBy: {
    select: {
      name: true,
      lastName: true,
    },
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type TicketListItem = {
  id: string;
  hash: string;
  status: TicketStatus;
  purchaseDate: Date;
  ticketType: { name: string; price: unknown };
  event: { id: string; name: string; eventDate: Date };
  orderItem: { id: string };
};

export type TicketDetail = {
  id: string;
  hash: string;
  qrPayload: string;
  status: TicketStatus;
  purchaseDate: Date;
  validatedAt: Date | null;
  createdAt: Date;
  buyerId: string;
  ticketType: { name: string; price: unknown };
  event: { id: string; name: string; eventDate: Date };
  orderItem: { id: string };
  order: { id: string; totalAmount: unknown };
  validatedBy: { name: string; lastName: string } | null;
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBuyer(
    buyerId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TicketDetail>> {
    const where = { buyerId };

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        select: TICKET_DETAIL_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { purchaseDate: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return createPaginatedResponse(
      data as unknown as TicketDetail[],
      total,
      page,
      limit,
    );
  }

  async findByEvent(
    eventId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TicketListItem>> {
    const where = { eventId };

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        select: TICKET_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { purchaseDate: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return createPaginatedResponse(
      data as unknown as TicketListItem[],
      total,
      page,
      limit,
    );
  }

  findById(id: string): Promise<TicketDetail | null> {
    return this.prisma.ticket.findUnique({
      where: { id },
      select: TICKET_DETAIL_SELECT,
    }) as Promise<TicketDetail | null>;
  }

  findByHash(hash: string): Promise<TicketDetail | null> {
    return this.prisma.ticket.findUnique({
      where: { hash },
      select: TICKET_DETAIL_SELECT,
    }) as Promise<TicketDetail | null>;
  }

  updateStatus(
    id: string,
    status: TicketStatus,
    validatedById?: string,
  ): Promise<TicketDetail> {
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status,
        ...(validatedById !== undefined
          ? { validatedById, validatedAt: new Date() }
          : {}),
      },
      select: TICKET_DETAIL_SELECT,
    }) as Promise<TicketDetail>;
  }
}
