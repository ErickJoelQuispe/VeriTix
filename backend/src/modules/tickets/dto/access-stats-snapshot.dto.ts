import { ApiProperty } from '@nestjs/swagger';

export class AccessStatsSnapshotDto {
  @ApiProperty({ description: 'ID del evento' })
  eventId: string;

  @ApiProperty({ description: 'Capacidad máxima del evento' })
  capacity: number;

  @ApiProperty({ description: 'Total de tickets vendidos para el evento' })
  total: number;

  @ApiProperty({ description: 'Tickets validados (USED)' })
  validated: number;

  @ApiProperty({ description: 'Tickets pendientes de validar (ACTIVE)' })
  pending: number;

  @ApiProperty({ description: 'Tickets denegados (CANCELLED o REFUNDED)' })
  denied: number;

  @ApiProperty({ description: 'Porcentaje de asistencia sobre tickets vendidos (validated / total * 100)' })
  percentage: number;

  @ApiProperty({ description: 'Porcentaje de aforo ocupado (validated / capacity * 100)' })
  occupancy: number;

  @ApiProperty({ description: 'Timestamp de la última actualización' })
  lastUpdated: Date;
}
