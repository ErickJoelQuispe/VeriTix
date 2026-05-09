import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import {
  CACHE_KEYS,
  CACHE_TTL_MEDIUM,
  CACHE_TTL_SHORT,
  CacheService,
} from '../../cache';
import { EventStatus, OrderStatus, Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEventDto,
  EventDetailResponseDto,
  EventListResponseDto,
  EventMetricsResponseDto,
  EventQueryDto,
  RequiresAttentionResponseDto,
  TopEventResponseDto,
  TopEventsQueryDto,
  UpcomingEventResponseDto,
  UpcomingQueryDto,
  UpdateEventDto,
} from './dto';
import { EventsRepository } from './events.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ── Private helpers ──────────────────────────────────────────────────────

  private async validateVenueExists(venueId: string): Promise<void> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true },
    });
    if (!venue) throw new NotFoundException('Recinto no encontrado');
  }

  private assertOwnerOrAdmin(
    event: { creatorId: string },
    userId: string,
    userRole: Role,
  ): void {
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No tenés permiso para modificar este evento',
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  private buildEventsListCacheKey(query: EventQueryDto): string {
    return CACHE_KEYS.EVENTS_LIST(
      JSON.stringify({
        page: query.page,
        limit: query.limit,
        city: query.city,
        genreId: query.genreId,
        formatId: query.formatId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        search: query.search,
        artistName: query.artistName,
        venueName: query.venueName,
      }),
    );
  }

  private async invalidateEventCache(id: string): Promise<void> {
    await this.cache.del(CACHE_KEYS.EVENTS_DETAIL_STATIC(id));
    // No invalidamos listas por prefijo: usamos TTL corto para evitar complejidad.
  }

  async create(
    creatorId: string,
    dto: CreateEventDto,
  ): Promise<EventDetailResponseDto> {
    await this.validateVenueExists(dto.venueId);

    const created = await this.eventsRepository.create({
      ...dto,
      creatorId,
    });

    await this.invalidateEventCache(created.id);

    return created as unknown as EventDetailResponseDto;
  }

  async findAll(
    query: EventQueryDto,
  ): Promise<PaginatedResponse<EventListResponseDto>> {
    const key = this.buildEventsListCacheKey(query);

    return this.cache.getOrSet(
      key,
      () =>
        this.eventsRepository.findAll({
          page: query.page,
          limit: query.limit,
          city: query.city,
          genreId: query.genreId,
          formatId: query.formatId,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          search: query.search,
          artistName: query.artistName,
          venueName: query.venueName,
        }),
      CACHE_TTL_SHORT,
    ) as Promise<PaginatedResponse<EventListResponseDto>>;
  }

  async findMyEvents(
    creatorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<EventListResponseDto>> {
    return this.eventsRepository.findByCreator(
      creatorId,
      page,
      limit,
    ) as Promise<PaginatedResponse<EventListResponseDto>>;
  }

  async findOne(
    id: string,
    requestingUser?: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    const event = await this.cache.getOrSet(
      CACHE_KEYS.EVENTS_DETAIL_STATIC(id),
      () => this.eventsRepository.findById(id),
      CACHE_TTL_MEDIUM,
    );

    if (!event) throw new NotFoundException('Evento no encontrado');

    if (event.status === EventStatus.DRAFT) {
      const isCreator = requestingUser?.sub === event.creatorId;
      const isAdmin = requestingUser?.role === Role.ADMIN;
      if (!isCreator && !isAdmin) {
        throw new NotFoundException('Evento no encontrado');
      }
    }

    return event as unknown as EventDetailResponseDto;
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateEventDto,
  ): Promise<EventDetailResponseDto> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    this.assertOwnerOrAdmin(event, userId, userRole);

    if (dto.venueId) {
      await this.validateVenueExists(dto.venueId);
    }

    const updated = await this.eventsRepository.update(id, dto);
    await this.invalidateEventCache(id);
    return updated as unknown as EventDetailResponseDto;
  }

  async cancel(id: string): Promise<void> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    await this.eventsRepository.updateStatus(id, EventStatus.CANCELLED);
    await this.invalidateEventCache(id);
  }

  async publish(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<EventDetailResponseDto> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    this.assertOwnerOrAdmin(event, userId, userRole);

    if (event.status !== EventStatus.DRAFT) {
      throw new ConflictException(
        'El evento solo puede publicarse si está en estado DRAFT',
      );
    }

    const published = await this.eventsRepository.updateStatus(
      id,
      EventStatus.PUBLISHED,
    );
    await this.invalidateEventCache(id);
    return published as unknown as EventDetailResponseDto;
  }

  // ── Analytics ────────────────────────────────────────────────────────────

  async getUpcoming(
    user: JwtPayload,
    query: UpcomingQueryDto,
  ): Promise<UpcomingEventResponseDto[]> {
    const creatorId = user.role === Role.ADMIN ? undefined : user.sub;
    const rows = await this.cache.getOrSet(
      CACHE_KEYS.EVENTS_UPCOMING(user.role, creatorId ?? 'all', query.limit),
      () => this.eventsRepository.findUpcoming(query.limit, creatorId),
      CACHE_TTL_SHORT,
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      eventDate: r.eventDate,
      venue: r.venue,
      ticketsSold: r.ticketsSold,
      totalCapacity: r.maxCapacity,
    }));
  }

  async getRequiresAttention(
    user: JwtPayload,
  ): Promise<RequiresAttentionResponseDto[]> {
    const creatorId = user.role === Role.ADMIN ? undefined : user.sub;
    const rows = await this.eventsRepository.findRequiresAttention(creatorId);

    const result: RequiresAttentionResponseDto[] = [];

    for (const row of rows) {
      const issues: string[] = [];

      if (!row.imageUrl) issues.push('Sin imagen');
      if (!row.formatId) issues.push('Sin formato');
      if (row._count.artists === 0) issues.push('Sin artistas');
      if (row._count.ticketTypes === 0) issues.push('Sin tipos de entrada');

      // "Sin entradas disponibles" solo aplica a PUBLISHED
      if (
        row.status === EventStatus.PUBLISHED &&
        row._count.ticketTypes > 0 &&
        row.ticketTypes.reduce((sum, tt) => sum + tt.availableQuantity, 0) === 0
      ) {
        issues.push('Sin entradas disponibles');
      }

      if (issues.length > 0) {
        result.push({
          id: row.id,
          name: row.name,
          status: row.status,
          eventDate: row.eventDate,
          issues,
        });
      }
    }

    return result;
  }

  async getTopEvents(query: TopEventsQueryDto): Promise<TopEventResponseDto[]> {
    const rows = await this.cache.getOrSet(
      CACHE_KEYS.EVENTS_TOP(query.limit),
      () => this.eventsRepository.findTopEvents(query.limit),
      CACHE_TTL_SHORT,
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      eventDate: r.eventDate,
      venue: r.venue,
      ticketsSold: r.ticketsSold,
      totalCapacity: r.maxCapacity,
      revenue: r.revenue,
    }));
  }

  async getEventMetrics(
    id: string,
    user: JwtPayload,
  ): Promise<EventMetricsResponseDto> {
    const raw = await this.eventsRepository.findMetricsById(id);
    if (!raw) throw new NotFoundException('Evento no encontrado');

    this.assertOwnerOrAdmin(raw, user.sub, user.role);

    // ── Capacidad ──────────────────────────────────────────────────────────
    let sold = 0;
    for (const tt of raw.ticketTypes) {
      for (const item of tt.orderItems) {
        if (item.order.status === OrderStatus.COMPLETED) {
          sold += item.quantity;
        }
      }
    }
    const total = raw.maxCapacity;
    const available = total - sold;
    const occupancyRate =
      total > 0 ? Math.round((sold / total) * 10000) / 10000 : 0;

    // ── Revenue por tipo de ticket ─────────────────────────────────────────
    let totalRevenue = 0;
    const byTicketType = raw.ticketTypes.map((tt) => {
      let ttSold = 0;
      let ttRevenue = 0;
      for (const item of tt.orderItems) {
        if (item.order.status === OrderStatus.COMPLETED) {
          ttSold += item.quantity;
          ttRevenue += Number(item.subtotal);
        }
      }
      totalRevenue += ttRevenue;
      return {
        name: tt.name,
        sold: ttSold,
        revenue: Math.round(ttRevenue * 100) / 100,
      };
    });

    // ── Órdenes por estado ─────────────────────────────────────────────────
    const orderCounts = {
      total: raw.orders.length,
      completed: 0,
      pending: 0,
      cancelled: 0,
      refunded: 0,
    };
    for (const o of raw.orders) {
      if (o.status === OrderStatus.COMPLETED) orderCounts.completed++;
      else if (o.status === OrderStatus.PENDING) orderCounts.pending++;
      else if (o.status === OrderStatus.CANCELLED) orderCounts.cancelled++;
      else if (o.status === OrderStatus.REFUNDED) orderCounts.refunded++;
    }

    // ── Top ticket type ────────────────────────────────────────────────────
    const topTicketType =
      byTicketType.length > 0
        ? byTicketType.reduce((best, tt) => (tt.sold > best.sold ? tt : best))
        : null;

    return {
      eventId: raw.id,
      eventName: raw.name,
      status: raw.status,
      capacity: { total, sold, available, occupancyRate },
      revenue: { total: Math.round(totalRevenue * 100) / 100, byTicketType },
      orders: orderCounts,
      topTicketType:
        topTicketType && topTicketType.sold > 0
          ? { name: topTicketType.name, sold: topTicketType.sold }
          : null,
    };
  }
}
