import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { OrderStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

// ── Select constants ──────────────────────────────────────────────────────────

export const ORDER_LIST_SELECT = {
  id: true,
  totalAmount: true,
  status: true,
  createdAt: true,
  event: {
    select: {
      id: true,
      name: true,
      eventDate: true,
    },
  },
  payments: {
    select: { providerSessionId: true },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} as const;

export const ORDER_DETAIL_SELECT = {
  id: true,
  totalAmount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  event: {
    select: {
      id: true,
      name: true,
      eventDate: true,
      currency: true,
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      subtotal: true,
      ticketType: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
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
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderListItem = {
  id: string;
  totalAmount: unknown; // Prisma Decimal — convertir con Number()
  status: OrderStatus;
  createdAt: Date;
  event: { id: string; name: string; eventDate: Date };
  payments: { providerSessionId: string | null }[];
};

export type OrderDetail = {
  id: string;
  totalAmount: unknown; // Prisma Decimal — convertir con Number()
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  event: { id: string; name: string; eventDate: Date; currency: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: unknown;
    subtotal: unknown;
    ticketType: { id: string; name: string; price: unknown };
  }[];
  payments: {
    id: string;
    amount: unknown;
    currency: string;
    status: string;
    provider: string;
    providerPaymentId: string | null;
    providerSessionId: string | null;
    failureReason: string | null;
    paidAt: Date | null;
    createdAt: Date;
  }[];
};

export type CreateOrderData = {
  buyerId: string;
  eventId: string;
  totalAmount: number;
  items: {
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ──────────────────────────────────────────────────────────────

  async findByBuyer(
    buyerId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<OrderListItem>> {
    const where = { buyerId };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: ORDER_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return createPaginatedResponse(
      data as unknown as OrderListItem[],
      total,
      page,
      limit,
    );
  }

  async findByEvent(
    eventId: string,
    page: number,
    limit: number,
    status?: OrderStatus,
  ): Promise<PaginatedResponse<OrderListItem>> {
    const where = {
      eventId,
      ...(status !== undefined ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: ORDER_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return createPaginatedResponse(
      data as unknown as OrderListItem[],
      total,
      page,
      limit,
    );
  }

  findById(id: string): Promise<OrderDetail | null> {
    return this.prisma.order.findUnique({
      where: { id },
      select: ORDER_DETAIL_SELECT,
    }) as Promise<OrderDetail | null>;
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  create(data: CreateOrderData): Promise<OrderDetail> {
    return this.prisma.order.create({
      data: {
        buyerId: data.buyerId,
        eventId: data.eventId,
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((item) => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      select: ORDER_DETAIL_SELECT,
    }) as Promise<OrderDetail>;
  }

  updateStatus(id: string, status: OrderStatus): Promise<OrderDetail> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      select: ORDER_DETAIL_SELECT,
    }) as Promise<OrderDetail>;
  }
}
