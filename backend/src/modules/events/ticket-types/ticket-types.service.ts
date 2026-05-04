import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTicketTypeDto, TicketTypeResponseDto, UpdateTicketTypeDto } from './dto';
import { TicketTypeRecord, TicketTypesRepository } from './ticket-types.repository';

@Injectable()
export class TicketTypesService {
  constructor(
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Private helpers ──────────────────────────────────────────────────────

  private async validateEventExists(
    eventId: string,
  ): Promise<{ id: string; creatorId: string; maxCapacity: number }> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true, maxCapacity: true },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  private async validateCapacity(
    eventId: string,
    maxCapacity: number,
    incomingQuantity: number,
    excludeTicketTypeId?: string,
  ): Promise<void> {
    const where = excludeTicketTypeId
      ? { eventId, id: { not: excludeTicketTypeId } }
      : { eventId };

    const agg = await this.prisma.ticketType.aggregate({
      where,
      _sum: { totalQuantity: true },
    });

    const existingSum = agg._sum.totalQuantity ?? 0;
    if (existingSum + incomingQuantity > maxCapacity) {
      throw new BadRequestException(
        'La capacidad total de los tipos de ticket supera la capacidad máxima del evento',
      );
    }
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

  private toResponse(record: TicketTypeRecord): TicketTypeResponseDto {
    return {
      ...record,
      price: Number(record.price),
    } as TicketTypeResponseDto;
  }

  // ── Public methods ───────────────────────────────────────────────────────

  async create(
    eventId: string,
    userId: string,
    userRole: Role,
    dto: CreateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    const event = await this.validateEventExists(eventId);
    this.assertOwnerOrAdmin(event, userId, userRole);

    await this.validateCapacity(eventId, event.maxCapacity, dto.totalQuantity);

    const created = await this.ticketTypesRepository.create(eventId, dto);
    return this.toResponse(created);
  }

  async findByEvent(eventId: string): Promise<TicketTypeResponseDto[]> {
    await this.validateEventExists(eventId);
    const records = await this.ticketTypesRepository.findByEventId(eventId);
    return records.map((r) => this.toResponse(r));
  }

  async update(
    eventId: string,
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    const event = await this.validateEventExists(eventId);
    this.assertOwnerOrAdmin(event, userId, userRole);

    const ticketType = await this.ticketTypesRepository.findById(id);
    if (!ticketType || ticketType.eventId !== eventId) {
      throw new NotFoundException('Tipo de boleto no encontrado');
    }

    if (dto.totalQuantity !== undefined) {
      await this.validateCapacity(eventId, event.maxCapacity, dto.totalQuantity, id);
    }

    const updated = await this.ticketTypesRepository.update(id, dto);
    return this.toResponse(updated);
  }

  async remove(
    eventId: string,
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<void> {
    const event = await this.validateEventExists(eventId);
    this.assertOwnerOrAdmin(event, userId, userRole);

    const ticketType = await this.ticketTypesRepository.findById(id);
    if (!ticketType || ticketType.eventId !== eventId) {
      throw new NotFoundException('Tipo de boleto no encontrado');
    }

    await this.ticketTypesRepository.delete(id);
  }
}
