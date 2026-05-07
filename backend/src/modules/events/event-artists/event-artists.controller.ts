import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
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
import { CurrentUser, Public, Roles } from '@common/decorators';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../../generated/prisma/enums';
import { AddEventArtistDto, EventArtistResponseDto } from './dto';
import { EventArtistsService } from './event-artists.service';

@ApiTags('Artistas del Evento')
@Controller('events/:eventId/artists')
export class EventArtistsController {
  constructor(private readonly eventArtistsService: EventArtistsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar artista al evento (creator del evento o admin)' })
  @ApiCreatedResponse({
    description: 'Artista agregado al evento exitosamente.',
    type: EventArtistResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento o artista no encontrado.' })
  @ApiConflictResponse({ description: 'Este artista ya está asignado a este evento.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  add(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddEventArtistDto,
  ): Promise<EventArtistResponseDto> {
    return this.eventArtistsService.add(eventId, user.sub, user.role, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar artistas del evento (público)' })
  @ApiOkResponse({
    description: 'Lista de artistas del evento ordenados por orden de presentación.',
    type: [EventArtistResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  findAll(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventArtistResponseDto[]> {
    return this.eventArtistsService.findByEvent(eventId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar artista del evento (creator del evento o admin)' })
  @ApiNoContentResponse({ description: 'Artista eliminado del evento exitosamente.' })
  @ApiNotFoundResponse({ description: 'Evento o artista del evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.eventArtistsService.remove(eventId, id, user.sub, user.role);
  }
}
