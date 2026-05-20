import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { CurrentUser, Public, Roles } from '@common/decorators';
import { OptionalJwtAuthGuard } from '@common/guards';
import { PaginatedResponse, PaginationQueryDto } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import { ReviewsService } from '../reviews/reviews.service';
import { AccessStatsService } from '../tickets/access-stats.service';
import {
  BuyerEventItemDto,
  BuyerEventsQueryDto,
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
import { EventsService } from './events.service';

@ApiTags('Eventos')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly accessStatsService: AccessStatsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear evento (creator o admin)' })
  @ApiCreatedResponse({
    description: 'Evento creado exitosamente.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Recinto no encontrado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a creadores y administradores.' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateEventDto,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.create(user.sub, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar eventos publicados (público, paginado)' })
  @ApiOkResponse({ description: 'Lista paginada de eventos publicados.' })
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  // IMPORTANT: static routes MUST be defined before :id to avoid route conflict

  @Get('my-events')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar mis eventos (todos los estados, autenticado)' })
  @ApiOkResponse({ description: 'Lista paginada de eventos del usuario autenticado.' })
  findMyEvents(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.eventsService.findMyEvents(user.sub, query.page, query.limit);
  }

  // NOTE: GET /events/mine MUST be declared before GET /events/:id to avoid route conflict
  @Get('mine')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eventos comprados por el usuario autenticado (agrupados por evento)' })
  @ApiOkResponse({ description: 'Lista paginada de eventos con tickets del usuario autenticado.' })
  findBuyerEvents(
    @CurrentUser() user: JwtPayload,
    @Query() query: BuyerEventsQueryDto,
  ): Promise<PaginatedResponse<BuyerEventItemDto>> {
    return this.eventsService.findBuyerEvents(user.sub, query);
  }

  @Get('upcoming')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Próximos eventos publicados (admin: todos, creator: los suyos)',
  })
  @ApiOkResponse({ type: [UpcomingEventResponseDto] })
  getUpcoming(
    @CurrentUser() user: JwtPayload,
    @Query() query: UpcomingQueryDto,
  ): Promise<UpcomingEventResponseDto[]> {
    return this.eventsService.getUpcoming(user, query);
  }

  @Get('requires-attention')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Eventos con problemas (sin imagen, artistas, ticket types, etc.)',
  })
  @ApiOkResponse({ type: [RequiresAttentionResponseDto] })
  getRequiresAttention(
    @CurrentUser() user: JwtPayload,
  ): Promise<RequiresAttentionResponseDto[]> {
    return this.eventsService.getRequiresAttention(user);
  }

  @Get('top-events')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eventos más populares por tickets vendidos (solo admin)' })
  @ApiOkResponse({ type: [TopEventResponseDto] })
  getTopEvents(
    @Query() query: TopEventsQueryDto,
  ): Promise<TopEventResponseDto[]> {
    return this.eventsService.getTopEvents(query);
  }

  @Get(':id/access-stats/stream')
  @Sse()
  @Roles(Role.ADMIN, Role.CREATOR, Role.VALIDATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Stream SSE de estadísticas de acceso en tiempo real (admin o creator)',
  })
  @ApiOkResponse({
    description:
      'Stream SSE con snapshots de acceso: total, validados, pendientes, porcentaje.',
  })
  @ApiForbiddenResponse({ description: 'Acceso restringido a administradores y creadores.' })
  streamAccessStats(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Observable<MessageEvent> {
    if (user.role !== Role.ADMIN && user.role !== Role.CREATOR && user.role !== Role.VALIDATOR) {
      throw new ForbiddenException(
        'Solo administradores, creadores y validadores pueden ver las estadísticas de acceso',
      );
    }

    return this.accessStatsService.getStream(id).pipe(
      map((snapshot) => ({ data: snapshot }) as MessageEvent),
    );
  }

  // NOTE: GET /events/:id/reviews and GET /events/:id/admin-detail MUST be before GET /events/:id
  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'List public reviews for an event (no auth required)' })
  @ApiOkResponse({ description: 'Paginated list of reviews for the event.' })
  getEventReviews(
    @Param('id') eventId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reviewsService.findByEvent(eventId, { page: query.page, limit: query.limit });
  }

  @Get(':id/admin-detail')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener evento por ID para backoffice (admin o creator propietario)' })
  @ApiOkResponse({
    description: 'Evento encontrado para administración.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para ver este evento.' })
  findOneAdminDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.findOneAdminDetail(id, user);
  }

  @Get(':id')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener evento por ID (público)' })
  @ApiOkResponse({
    description: 'Evento encontrado.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar evento (propio creator o admin)' })
  @ApiOkResponse({
    description: 'Evento actualizado exitosamente.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateEventDto,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar evento (solo admin)' })
  @ApiNoContentResponse({ description: 'Evento cancelado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a administradores.' })
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.eventsService.cancel(id);
  }

  @Get(':id/metrics')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Métricas de un evento (admin: cualquiera, creator: el suyo)',
  })
  @ApiOkResponse({ type: EventMetricsResponseDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para ver las métricas de este evento.' })
  getEventMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventMetricsResponseDto> {
    return this.eventsService.getEventMetrics(id, user);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Publicar evento (propio creator o admin)' })
  @ApiOkResponse({
    description: 'Evento publicado exitosamente.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiConflictResponse({ description: 'El evento debe estar en estado DRAFT para publicarse.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para publicar este evento.' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.publish(id, user.sub, user.role);
  }
}
