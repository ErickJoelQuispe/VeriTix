import { ApiProperty } from '@nestjs/swagger';

export class AccessStatsSnapshotDto {
  @ApiProperty({ description: 'ID del evento' })
  eventId: string;

  @ApiProperty({ description: 'Total de tickets vendidos para el evento' })
  total: number;

  @ApiProperty({ description: 'Tickets validados (USED)' })
  validated: number;

  @ApiProperty({ description: 'Tickets pendientes de validar (ACTIVE)' })
  pending: number;

  @ApiProperty({ description: 'Porcentaje de asistencia (validated / total * 100)' })
  percentage: number;

  @ApiProperty({ description: 'Timestamp de la última actualización' })
  lastUpdated: Date;
}
