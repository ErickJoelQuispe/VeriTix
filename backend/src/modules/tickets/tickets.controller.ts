import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import {
  TicketDetailResponseDto,
  TicketListResponseDto,
  ValidateTicketDto,
  ValidateTicketResponseDto,
} from './dto';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@ApiBearerAuth('access-token')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // IMPORTANT: static routes MUST be before /:id to avoid route conflict

  @Get('mine')
  @ApiOperation({
    summary: 'Mis tickets (buyer autenticado, paginado, con QR payload)',
  })
  @ApiOkResponse({ description: 'Lista paginada de tickets del usuario.' })
  getMyTickets(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.ticketsService.getMyTickets(user.sub, query.page, query.limit);
  }

  @Get('event/:eventId')
  @Roles(Role.ADMIN, Role.CREATOR, Role.VALIDATOR)
  @ApiOperation({
    summary:
      'Tickets de un evento (admin: cualquiera, creator: el suyo). Sin QR payload.',
  })
  @ApiOkResponse({
    description: 'Lista paginada de tickets del evento.',
    type: [TicketListResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({
    description: 'No tenés permiso para ver los tickets de este evento.',
  })
  getEventTickets(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.ticketsService.getEventTickets(
      eventId,
      user,
      query.page,
      query.limit,
    );
  }

  @Post('validate')
  @Roles(Role.ADMIN, Role.VALIDATOR)
  @ApiOperation({
    summary: 'Validar ticket por hash (admin o validador en puerta)',
  })
  @ApiOkResponse({
    description: 'Ticket validado exitosamente.',
    type: ValidateTicketResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Ticket no encontrado.' })
  @ApiConflictResponse({
    description:
      'El ticket ya fue utilizado, cancelado o reembolsado.',
  })
  validateTicket(
    @Body() dto: ValidateTicketDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ValidateTicketResponseDto> {
    return this.ticketsService.validateTicket(dto.payload, user.sub);
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Descargar ticket como PDF (solo el dueño del ticket)',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF del ticket generado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Ticket no encontrado.' })
  @ApiForbiddenResponse({
    description: 'No tenés permiso para descargar este ticket.',
  })
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.ticketsService.generateTicketPdf(id, user.sub);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ticket-${id}.pdf"`,
    );
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalle de un ticket (owner o admin, con QR payload)',
  })
  @ApiOkResponse({
    description: 'Ticket encontrado.',
    type: TicketDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Ticket no encontrado.' })
  @ApiForbiddenResponse({
    description: 'No tenés permiso para ver este ticket.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<TicketDetailResponseDto> {
    return this.ticketsService.findOne(id, user);
  }
}
