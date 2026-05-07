import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import {
  CreateTicketTypeDto,
  TicketTypeResponseDto,
  UpdateTicketTypeDto,
} from './dto';
import { TicketTypesService } from './ticket-types.service';

@ApiTags('Tipos de Boleto')
@Controller('events/:eventId/ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear tipo de boleto (creator del evento o admin)' })
  @ApiCreatedResponse({
    description: 'Tipo de boleto creado exitosamente.',
    type: TicketTypeResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketTypesService.create(eventId, user.sub, user.role, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar tipos de boleto del evento (público)' })
  @ApiOkResponse({
    description: 'Lista de tipos de boleto ordenados por precio.',
    type: [TicketTypeResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  findAll(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<TicketTypeResponseDto[]> {
    return this.ticketTypesService.findByEvent(eventId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar tipo de boleto (creator del evento o admin)' })
  @ApiOkResponse({
    description: 'Tipo de boleto actualizado exitosamente.',
    type: TicketTypeResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento o tipo de boleto no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  update(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketTypesService.update(eventId, id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar tipo de boleto (creator del evento o admin)' })
  @ApiNoContentResponse({ description: 'Tipo de boleto eliminado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Evento o tipo de boleto no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.ticketTypesService.remove(eventId, id, user.sub, user.role);
  }
}
