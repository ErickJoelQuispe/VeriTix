import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { EventStatus, OrderStatus } from '../../generated/prisma/enums';
import type { EventWhereInput } from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

// ── Select constants ──────────────────────────────────────────────────────────

export const EVENT_LIST_SELECT = {
  id: true,
  name: true,
  eventDate: true,
  status: true,
  imageUrl: true,
  currency: true,
  venue: { select: { id: true, name: true, city: true } },
  format: { select: { id: true, name: true } },
} as const;

export const EVENT_DETAIL_SELECT = {
  id: true,
  name: true,
  description: true,
  eventDate: true,
  doorsOpenTime: true,
  startSale: true,
  endSale: true,
  maxCapacity: true,
  status: true,
  imageUrl: true,
  currency: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  venue: {
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      state: true,
      country: true,
      capacity: true,
      type: true,
      imageUrl: true,
    },
  },
  format: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
    },
  },
  genres: { select: { id: true, name: true, slug: true } },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventListItem = {
  id: string;
  name: string;
  eventDate: Date;
  status: EventStatus;
  imageUrl: string | null;
  currency: string;
  venue: { id: string; name: string; city: string };
  format: { id: string; name: string } | null;
};

export type EventDetail = {
  id: string;
  name: string;
  description: string | null;
  eventDate: Date;
  doorsOpenTime: Date | null;
  startSale: Date | null;
  endSale: Date | null;
  maxCapacity: number;
  status: EventStatus;
  imageUrl: string | null;
  currency: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string | null;
    country: string;
    capacity: number | null;
    type: string;
    imageUrl: string | null;
  };
  format: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
  } | null;
  genres: { id: string; name: string; slug: string }[];
};

export type CreateEventData = {
  name: string;
  description?: string;
  eventDate: string;
  doorsOpenTime?: string;
  startSale?: string;
  endSale?: string;
  maxCapacity: number;
  imageUrl?: string;
  currency?: string;
  creatorId: string;
  venueId: string;
  formatId?: string;
  genreIds?: string[];
};

export type UpdateEventData = Partial<{
  name: string;
  description: string | null;
  eventDate: string;
  doorsOpenTime: string | null;
  startSale: string | null;
  endSale: string | null;
  maxCapacity: number;
  imageUrl: string | null;
  currency: string;
  venueId: string;
  formatId: string | null;
  genreIds: string[];
}>;

export type FindAllEventsParams = {
  page: number;
  limit: number;
  city?: string;
  genreId?: string;
  formatId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  artistName?: string;
};

// ── Analytics types ───────────────────────────────────────────────────────────

export type UpcomingEventRow = {
  id: string;
  name: string;
  eventDate: Date;
  maxCapacity: number;
  venue: { name: string; city: string };
  // Calculado en el service desde los orderItems
  ticketsSold: number;
};

export type RequiresAttentionRow = {
  id: string;
  name: string;
  status: EventStatus;
  eventDate: Date;
  imageUrl: string | null;
  formatId: string | null;
  // Conteos para detectar issues
  _count: { artists: number; ticketTypes: number };
  // Para el issue "Sin entradas disponibles"
  ticketTypes: { availableQuantity: number }[];
};

export type TopEventRow = {
  id: string;
  name: string;
  eventDate: Date;
  maxCapacity: number;
  venue: { name: string; city: string };
  ticketsSold: number;
  revenue: number;
};

export type EventMetricsRaw = {
  id: string;
  name: string;
  status: EventStatus;
  creatorId: string;
  maxCapacity: number;
  ticketTypes: {
    id: string;
    name: string;
    totalQuantity: number;
    availableQuantity: number;
    orderItems: {
      quantity: number;
      subtotal: unknown; // Prisma Decimal
      order: { status: string };
    }[];
  }[];
  orders: { status: string }[];
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ─────────────────────────────────────────────────────────────

  async findAll(
    params: FindAllEventsParams,
  ): Promise<PaginatedResponse<EventListItem>> {
    const { page, limit, city, genreId, formatId, dateFrom, dateTo, search, artistName } =
      params;

    const where: EventWhereInput = {
      status: EventStatus.PUBLISHED,
    };

    if (city !== undefined)
      where.venue = { city: { contains: city, mode: 'insensitive' } };
    if (genreId !== undefined) where.genres = { some: { id: genreId } };
    if (formatId !== undefined) where.formatId = formatId;
    if (dateFrom !== undefined || dateTo !== undefined) {
      where.eventDate = {};
      if (dateFrom !== undefined) where.eventDate.gte = new Date(dateFrom);
      if (dateTo !== undefined) where.eventDate.lte = new Date(dateTo);
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (artistName) {
      where.artists = {
        some: { artist: { name: { contains: artistName, mode: 'insensitive' } } },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        select: EVENT_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { eventDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return createPaginatedResponse(
      data as EventListItem[],
      total,
      page,
      limit,
    );
  }

  async findByCreator(
    creatorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<EventListItem>> {
    const where: EventWhereInput = { creatorId };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        select: EVENT_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return createPaginatedResponse(
      data as EventListItem[],
      total,
      page,
      limit,
    );
  }

  findById(id: string): Promise<EventDetail | null> {
    return this.prisma.event.findUnique({
      where: { id },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail | null>;
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  create(data: CreateEventData): Promise<EventDetail> {
    const { genreIds, ...rest } = data;
    return this.prisma.event.create({
      data: {
        ...rest,
        ...(genreIds && genreIds.length > 0
          ? { genres: { connect: genreIds.map((id) => ({ id })) } }
          : {}),
      },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail>;
  }

  update(id: string, data: UpdateEventData): Promise<EventDetail> {
    const { genreIds, ...rest } = data;
    return this.prisma.event.update({
      where: { id },
      data: {
        ...rest,
        ...(genreIds !== undefined
          ? { genres: { set: genreIds.map((gid) => ({ id: gid })) } }
          : {}),
      },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail>;
  }

  updateStatus(id: string, status: EventStatus): Promise<EventDetail> {
    return this.prisma.event.update({
      where: { id },
      data: { status },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail>;
  }

  // ── Analytics queries ────────────────────────────────────────────────────

  async findUpcoming(
    limit: number,
    creatorId?: string,
  ): Promise<UpcomingEventRow[]> {
    const events = await this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        eventDate: { gte: new Date() },
        ...(creatorId !== undefined ? { creatorId } : {}),
      },
      select: {
        id: true,
        name: true,
        eventDate: true,
        maxCapacity: true,
        venue: { select: { name: true, city: true } },
        orders: {
          where: { status: OrderStatus.COMPLETED },
          select: {
            items: { select: { quantity: true } },
          },
        },
      },
      orderBy: { eventDate: 'asc' },
      take: limit,
    });

    return events.map((e) => ({
      id: e.id,
      name: e.name,
      eventDate: e.eventDate,
      maxCapacity: e.maxCapacity,
      venue: e.venue,
      ticketsSold: e.orders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0,
      ),
    }));
  }

  async findRequiresAttention(
    creatorId?: string,
  ): Promise<RequiresAttentionRow[]> {
    return this.prisma.event.findMany({
      where: {
        status: { in: [EventStatus.PUBLISHED, EventStatus.DRAFT] },
        ...(creatorId !== undefined ? { creatorId } : {}),
      },
      select: {
        id: true,
        name: true,
        status: true,
        eventDate: true,
        imageUrl: true,
        formatId: true,
        _count: { select: { artists: true, ticketTypes: true } },
        ticketTypes: { select: { availableQuantity: true } },
      },
      orderBy: { eventDate: 'asc' },
      take: 50,
    }) as Promise<RequiresAttentionRow[]>;
  }

  async findTopEvents(limit: number): Promise<TopEventRow[]> {
    // Prisma no soporta ORDER BY sobre un campo agregado de relación,
    // así que traemos los datos y ordenamos en memoria.
    // El take(limit * 4) garantiza margen para eventos sin ventas.
    const events = await this.prisma.event.findMany({
      select: {
        id: true,
        name: true,
        eventDate: true,
        maxCapacity: true,
        venue: { select: { name: true, city: true } },
        orders: {
          where: { status: OrderStatus.COMPLETED },
          select: {
            items: {
              select: { quantity: true, subtotal: true },
            },
          },
        },
      },
      orderBy: { eventDate: 'desc' },
      take: limit * 4,
    });

    const mapped = events.map((e) => {
      let ticketsSold = 0;
      let revenue = 0;
      for (const order of e.orders) {
        for (const item of order.items) {
          ticketsSold += item.quantity;
          revenue += Number(item.subtotal);
        }
      }
      return { id: e.id, name: e.name, eventDate: e.eventDate, maxCapacity: e.maxCapacity, venue: e.venue, ticketsSold, revenue };
    });

    return mapped
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, limit);
  }

  findMetricsById(id: string): Promise<EventMetricsRaw | null> {
    return this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        creatorId: true,
        maxCapacity: true,
        ticketTypes: {
          select: {
            id: true,
            name: true,
            totalQuantity: true,
            availableQuantity: true,
            orderItems: {
              select: {
                quantity: true,
                subtotal: true,
                order: { select: { status: true } },
              },
            },
          },
        },
        orders: { select: { status: true } },
      },
    }) as Promise<EventMetricsRaw | null>;
  }
}
