import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import {
  CreateOrderDto,
  OrderDetailResponseDto,
  OrderEventQueryDto,
  OrderListResponseDto,
} from './dto';
import { OrdersService } from './orders.service';

@ApiTags('Órdenes')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear orden de compra (cualquier usuario autenticado)',
  })
  @ApiCreatedResponse({
    description: 'Orden creada exitosamente.',
    type: OrderDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Evento o tipo de ticket no encontrado.',
  })
  @ApiBadRequestResponse({
    description: 'Evento no publicado, venta cerrada, o datos inválidos.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Stock insuficiente o límite por usuario excedido.',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.create(user.sub, dto);
  }

  // IMPORTANT: /my MUST be defined before /:id to avoid route conflict
  @Get('my')
  @ApiOperation({ summary: 'Mis órdenes (comprador autenticado, paginado)' })
  @ApiOkResponse({
    description: 'Lista paginada de órdenes del usuario autenticado.',
  })
  findMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.ordersService.findMyOrders(user.sub, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una orden (owner o admin)' })
  @ApiOkResponse({
    description: 'Orden encontrada.',
    type: OrderDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Orden no encontrada.' })
  @ApiForbiddenResponse({
    description: 'No tenés permiso para ver esta orden.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar orden PENDING (owner o admin)' })
  @ApiNoContentResponse({ description: 'Orden cancelada exitosamente.' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada.' })
  @ApiBadRequestResponse({ description: 'La orden no está en estado PENDING.' })
  @ApiForbiddenResponse({
    description: 'No tenés permiso para cancelar esta orden.',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.ordersService.cancel(id, user);
  }

  @Get('event/:eventId')
  @ApiOperation({
    summary: 'Ventas de un evento (creator del evento o admin)',
  })
  @ApiOkResponse({ description: 'Lista paginada de órdenes del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({
    description: 'No tenés permiso para ver las ventas de este evento.',
  })
  findByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: OrderEventQueryDto,
  ) {
    return this.ordersService.findByEvent(eventId, user, query);
  }
}
