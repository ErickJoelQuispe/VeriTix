import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginatedResponse } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import type { Stripe } from 'stripe';
import { EventStatus, OrderStatus, Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import {
  CreateOrderDto,
  OrderDetailResponseDto,
  OrderEventQueryDto,
  OrderListResponseDto,
} from './dto';
import {
  OrderDetail,
  OrderListItem,
  OrdersRepository,
} from './orders.repository';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toOrderListResponse(order: OrderListItem): OrderListResponseDto {
  return {
    id: order.id,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
    event: order.event,
    checkoutUrl: null,
  };
}

function toOrderDetailResponse(order: OrderDetail): OrderDetailResponseDto {
  return {
    id: order.id,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    event: order.event,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      ticketType: {
        id: item.ticketType.id,
        name: item.ticketType.name,
        price: Number(item.ticketType.price),
      },
    })),
    payments: order.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status as any,
      provider: p.provider,
      providerPaymentId: p.providerPaymentId,
      failureReason: p.failureReason,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    })),
    checkoutUrl: null,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  // ── Private helpers ──────────────────────────────────────────────────────

  private assertOwnerOrAdmin(
    order: { buyerId: string },
    userId: string,
    userRole: Role,
  ): void {
    if (order.buyerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('No tenés permiso para ver esta orden');
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  async create(
    buyerId: string,
    dto: CreateOrderDto,
  ): Promise<OrderDetailResponseDto & { checkoutUrl: string }> {
    // 1. Validar evento: existe y está PUBLISHED
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: {
        id: true,
        name: true,
        status: true,
        startSale: true,
        endSale: true,
        currency: true,
        imageUrl: true,
      },
    });

    if (!event) throw new NotFoundException('Evento no encontrado');

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Solo se pueden comprar entradas para eventos publicados',
      );
    }

    // 2. Validar ventana de venta del evento
    const now = new Date();
    if (event.startSale && now < event.startSale) {
      throw new BadRequestException('La venta de entradas aún no ha comenzado');
    }
    if (event.endSale && now > event.endSale) {
      throw new BadRequestException('La venta de entradas ya finalizó');
    }

    // 3. Validar TicketTypes en una sola query
    const ticketTypeIds = dto.items.map((i) => i.ticketTypeId);

    const ticketTypes = await this.prisma.ticketType.findMany({
      where: {
        id: { in: ticketTypeIds },
        eventId: dto.eventId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        availableQuantity: true,
        maxPerUser: true,
        saleStartDate: true,
        saleEndDate: true,
      },
    });

    if (ticketTypes.length !== ticketTypeIds.length) {
      throw new NotFoundException(
        'Uno o más tipos de ticket no existen o no pertenecen a este evento',
      );
    }

    const ticketTypeMap = new Map(ticketTypes.map((tt) => [tt.id, tt]));

    // 4. Validar stock, maxPerUser, ventana por ticket type
    const orderItems: {
      ticketTypeId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    let totalAmount = 0;

    for (const item of dto.items) {
      const tt = ticketTypeMap.get(item.ticketTypeId)!;

      if (tt.saleStartDate && now < tt.saleStartDate) {
        throw new BadRequestException(
          `La venta del ticket "${tt.name}" aún no ha comenzado`,
        );
      }
      if (tt.saleEndDate && now > tt.saleEndDate) {
        throw new BadRequestException(
          `La venta del ticket "${tt.name}" ya finalizó`,
        );
      }
      if (item.quantity > tt.maxPerUser) {
        throw new UnprocessableEntityException(
          `El máximo permitido por usuario para "${tt.name}" es ${tt.maxPerUser}`,
        );
      }
      if (item.quantity > tt.availableQuantity) {
        throw new UnprocessableEntityException(
          `Stock insuficiente para "${tt.name}". Disponible: ${tt.availableQuantity}`,
        );
      }

      const unitPrice = Number(tt.price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        ticketTypeId: item.ticketTypeId,
        name: tt.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // 5. Crear Order + decrementar stock en transacción (reserva optimista)
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQuantity: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          buyerId,
          eventId: dto.eventId,
          totalAmount,
          items: {
            create: orderItems.map((item) => ({
              ticketTypeId: item.ticketTypeId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          event: {
            select: { id: true, name: true, eventDate: true, currency: true },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
              ticketType: { select: { id: true, name: true, price: true } },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              provider: true,
              providerPaymentId: true,
              providerSessionId: true,
              failureReason: true,
              paidAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' as const },
          },
        },
      });
    });

    // 6. Crear Stripe Checkout Session
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60; // now + 30 min

    // Stripe.Checkout.Session — usando ReturnType para evitar namespace con import type
    let session: Awaited<ReturnType<Stripe['checkout']['sessions']['create']>>;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: orderItems.map((item) => ({
          price_data: {
            currency: (event.currency ?? 'eur').toLowerCase(),
            product_data: {
              name: item.name,
              ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
            },
            // Stripe usa centavos — multiplicamos por 100
            unit_amount: Math.round(item.unitPrice * 100),
          },
          quantity: item.quantity,
        })),
        metadata: { orderId: order.id },
        expires_at: expiresAt,
        success_url: `${frontendUrl}/orders/${order.id}/success`,
        cancel_url: `${frontendUrl}/orders/${order.id}/cancel`,
      });
    } catch {
      // Si Stripe falla, revertimos la orden y el stock
      await this.prisma.$transaction(async (tx) => {
        for (const item of dto.items) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { availableQuantity: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });
      });
      throw new InternalServerErrorException(
        'Error al crear la sesión de pago. Intentá de nuevo.',
      );
    }

    // 7. Crear registro Payment PENDING con providerSessionId
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        currency: (event.currency ?? 'EUR').toUpperCase(),
        providerSessionId: session.id,
      },
    });

    const response = toOrderDetailResponse(order as unknown as OrderDetail);
    return { ...response, checkoutUrl: session.url! };
  }

  async findMyOrders(
    buyerId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<OrderListResponseDto>> {
    const result = await this.ordersRepository.findByBuyer(
      buyerId,
      page,
      limit,
    );
    return {
      data: result.data.map(toOrderListResponse),
      meta: result.meta,
    };
  }

  async findOne(
    id: string,
    requestingUser: JwtPayload,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    this.assertOwnerOrAdmin(
      order as any,
      requestingUser.sub,
      requestingUser.role,
    );

    return toOrderDetailResponse(order);
  }

  async cancel(id: string, requestingUser: JwtPayload): Promise<void> {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    this.assertOwnerOrAdmin(
      order as any,
      requestingUser.sub,
      requestingUser.role,
    );

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden cancelar órdenes en estado PENDING',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.ticketType.update({
          where: { id: item.ticketType.id },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });
    });
  }

  async findByEvent(
    eventId: string,
    requestingUser: JwtPayload,
    query: OrderEventQueryDto,
  ): Promise<PaginatedResponse<OrderListResponseDto>> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');

    if (
      event.creatorId !== requestingUser.sub &&
      requestingUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'No tenés permiso para ver las ventas de este evento',
      );
    }

    const result = await this.ordersRepository.findByEvent(
      eventId,
      query.page,
      query.limit,
      query.status,
    );

    return {
      data: result.data.map(toOrderListResponse),
      meta: result.meta,
    };
  }
}
