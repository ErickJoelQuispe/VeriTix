import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../../../generated/prisma/enums';

// ── Upcoming ──────────────────────────────────────────────────────────────────

export class UpcomingEventResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Granada Indie Night 2026' })
  name: string;

  @ApiProperty({ example: '2026-09-19T21:00:00.000Z' })
  eventDate: Date;

  @ApiProperty({ example: { name: 'Palacio de Congresos', city: 'Granada' } })
  venue: { name: string; city: string };

  @ApiProperty({ example: 342, description: 'Tickets vendidos (órdenes COMPLETED).' })
  ticketsSold: number;

  @ApiProperty({ example: 2000, description: 'Capacidad máxima del evento.' })
  totalCapacity: number;
}

// ── Requires Attention ────────────────────────────────────────────────────────

export class RequiresAttentionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Granada Draft Rock Night' })
  name: string;

  @ApiProperty({ enum: EventStatus, example: EventStatus.DRAFT })
  status: EventStatus;

  @ApiPropertyOptional({ example: '2026-12-20T21:00:00.000Z', nullable: true })
  eventDate: Date;

  @ApiProperty({
    type: [String],
    example: ['Sin imagen', 'Sin artistas'],
    description: 'Lista de problemas detectados.',
  })
  issues: string[];
}

// ── Top Events ────────────────────────────────────────────────────────────────

export class TopEventResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Madrid Rock Fest 2025' })
  name: string;

  @ApiProperty({ example: '2025-11-15T20:00:00.000Z' })
  eventDate: Date;

  @ApiProperty({ example: { name: 'WiZink Center', city: 'Madrid' } })
  venue: { name: string; city: string };

  @ApiProperty({ example: 147, description: 'Total de tickets vendidos.' })
  ticketsSold: number;

  @ApiProperty({ example: 17000, description: 'Capacidad máxima del evento.' })
  totalCapacity: number;

  @ApiProperty({ example: 9185.0, description: 'Revenue total generado (EUR).' })
  revenue: number;
}

// ── Event Metrics ─────────────────────────────────────────────────────────────

export class TicketTypeRevenueDto {
  @ApiProperty({ example: 'General' })
  name: string;

  @ApiProperty({ example: 85, description: 'Tickets vendidos de este tipo.' })
  sold: number;

  @ApiProperty({ example: 4675.0, description: 'Revenue generado por este tipo.' })
  revenue: number;
}

export class EventCapacityDto {
  @ApiProperty({ example: 2000 })
  total: number;

  @ApiProperty({ example: 342 })
  sold: number;

  @ApiProperty({ example: 1658 })
  available: number;

  @ApiProperty({ example: 0.171, description: 'Tasa de ocupación (0-1).' })
  occupancyRate: number;
}

export class EventRevenueDto {
  @ApiProperty({ example: 14350.0, description: 'Revenue total del evento.' })
  total: number;

  @ApiProperty({ type: [TicketTypeRevenueDto] })
  byTicketType: TicketTypeRevenueDto[];
}

export class EventOrdersDto {
  @ApiProperty({ example: 22 })
  total: number;

  @ApiProperty({ example: 18 })
  completed: number;

  @ApiProperty({ example: 2 })
  pending: number;

  @ApiProperty({ example: 1 })
  cancelled: number;

  @ApiProperty({ example: 1 })
  refunded: number;
}

export class TopTicketTypeDto {
  @ApiProperty({ example: 'General' })
  name: string;

  @ApiProperty({ example: 250 })
  sold: number;
}

export class EventMetricsResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  eventId: string;

  @ApiProperty({ example: 'Granada Indie Night 2025' })
  eventName: string;

  @ApiProperty({ enum: EventStatus, example: EventStatus.FINISHED })
  status: EventStatus;

  @ApiProperty({ type: EventCapacityDto })
  capacity: EventCapacityDto;

  @ApiProperty({ type: EventRevenueDto })
  revenue: EventRevenueDto;

  @ApiProperty({ type: EventOrdersDto })
  orders: EventOrdersDto;

  @ApiPropertyOptional({ type: TopTicketTypeDto, nullable: true })
  topTicketType: TopTicketTypeDto | null;
}

// ── Query DTOs ────────────────────────────────────────────────────────────────

import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpcomingQueryDto {
  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 5;
}

export class TopEventsQueryDto {
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
