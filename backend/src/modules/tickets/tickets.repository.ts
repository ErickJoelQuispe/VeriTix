import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

// ── Select constants ──────────────────────────────────────────────────────────

export const TICKET_EVENT_SELECT = {
  id: true,
  name: true,
  eventDate: true,
  imageUrl: true,
  venue: {
    select: {
      id: true,
      name: true,
      city: true,
    },
  },
  format: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

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
    select: TICKET_EVENT_SELECT,
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
    select: TICKET_EVENT_SELECT,
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

export const TICKET_BUYER_WITH_EVENT_SELECT = {
  id: true,
  status: true,
  event: {
    select: TICKET_EVENT_SELECT,
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type TicketEventEnriched = {
  id: string;
  name: string;
  eventDate: Date;
  imageUrl: string | null;
  venue: { id: string; name: string; city: string };
  format: { id: string; name: string } | null;
};

export type TicketListItem = {
  id: string;
  hash: string;
  status: TicketStatus;
  purchaseDate: Date;
  ticketType: { name: string; price: unknown };
  event: TicketEventEnriched;
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
  event: TicketEventEnriched;
  orderItem: { id: string };
  order: { id: string; totalAmount: unknown };
  validatedBy: { name: string; lastName: string } | null;
};

export type TicketWithEvent = {
  id: string;
  status: TicketStatus;
  event: TicketEventEnriched;
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all tickets for a buyer with enriched event data (imageUrl, venue, format).
   * Pagination is intentionally omitted — callers group and paginate in-memory.
   */
  findByBuyerWithEvents(buyerId: string): Promise<TicketWithEvent[]> {
    return this.prisma.ticket.findMany({
      where: { buyerId },
      select: TICKET_BUYER_WITH_EVENT_SELECT,
    }) as Promise<TicketWithEvent[]>;
  }

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
