import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TicketTypeRecord = {
  id: string;
  name: string;
  description: string | null;
  price: unknown; // Prisma Decimal
  totalQuantity: number;
  availableQuantity: number;
  maxPerUser: number;
  isActive: boolean;
  saleStartDate: Date | null;
  saleEndDate: Date | null;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class TicketTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEventId(eventId: string): Promise<TicketTypeRecord[]> {
    return this.prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    }) as Promise<TicketTypeRecord[]>;
  }

  findById(id: string): Promise<TicketTypeRecord | null> {
    return this.prisma.ticketType.findUnique({
      where: { id },
    }) as Promise<TicketTypeRecord | null>;
  }

  create(eventId: string, dto: CreateTicketTypeDto): Promise<TicketTypeRecord> {
    return this.prisma.ticketType.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        totalQuantity: dto.totalQuantity,
        availableQuantity: dto.totalQuantity, // set availableQuantity = totalQuantity
        maxPerUser: dto.maxPerUser ?? 4,
        isActive: dto.isActive ?? true,
        saleStartDate: dto.saleStartDate ? new Date(dto.saleStartDate) : null,
        saleEndDate: dto.saleEndDate ? new Date(dto.saleEndDate) : null,
        eventId,
      },
    }) as Promise<TicketTypeRecord>;
  }

  update(id: string, dto: UpdateTicketTypeDto): Promise<TicketTypeRecord> {
    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.totalQuantity !== undefined) data.totalQuantity = dto.totalQuantity;
    if (dto.maxPerUser !== undefined) data.maxPerUser = dto.maxPerUser;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.saleStartDate !== undefined)
      data.saleStartDate = dto.saleStartDate ? new Date(dto.saleStartDate) : null;
    if (dto.saleEndDate !== undefined)
      data.saleEndDate = dto.saleEndDate ? new Date(dto.saleEndDate) : null;

    return this.prisma.ticketType.update({
      where: { id },
      data,
    }) as Promise<TicketTypeRecord>;
  }

  delete(id: string): Promise<TicketTypeRecord> {
    return this.prisma.ticketType.delete({
      where: { id },
    }) as Promise<TicketTypeRecord>;
  }
}
