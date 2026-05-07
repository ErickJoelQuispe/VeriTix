import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../../../generated/prisma/enums';

export class VenueDetailDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Palacio de Congresos de Granada' })
  name: string;

  @ApiProperty({ example: 'palacio-congresos-granada' })
  slug: string;

  @ApiProperty({ example: 'Paseo del Violon, s/n' })
  address: string;

  @ApiProperty({ example: 'Granada' })
  city: string;

  @ApiProperty({ example: 'Andalucia', nullable: true })
  state: string | null;

  @ApiProperty({ example: 'ES' })
  country: string;

  @ApiProperty({ example: 65000, nullable: true })
  capacity: number | null;

  @ApiProperty({ example: 'FORO' })
  type: string;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/venues/palacio-congresos-granada.jpg',
    nullable: true,
  })
  imageUrl: string | null;
}

export class FormatDetailDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Festival' })
  name: string;

  @ApiProperty({ example: 'festival' })
  slug: string;

  @ApiPropertyOptional({
    example: 'Evento con múltiples escenarios.',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({ example: '🎪', nullable: true })
  icon: string | null;
}

export class GenreSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Rock' })
  name: string;

  @ApiProperty({ example: 'rock' })
  slug: string;
}

export class EventDetailResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del evento (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'Noche Indie en Granada',
    description: 'Nombre del evento.',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Una noche épica de rock en vivo.',
    description: 'Descripción del evento.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '2025-12-31T21:00:00Z',
    description: 'Fecha y hora del evento.',
  })
  eventDate: Date;

  @ApiPropertyOptional({
    example: '2025-12-31T19:30:00Z',
    description: 'Hora de apertura de puertas.',
    nullable: true,
  })
  doorsOpenTime: Date | null;

  @ApiPropertyOptional({
    example: '2025-10-01T00:00:00Z',
    description: 'Inicio de venta de boletos.',
    nullable: true,
  })
  startSale: Date | null;

  @ApiPropertyOptional({
    example: '2025-12-31T18:00:00Z',
    description: 'Fin de venta de boletos.',
    nullable: true,
  })
  endSale: Date | null;

  @ApiProperty({ example: 5000, description: 'Capacidad máxima del evento.' })
  maxCapacity: number;

  @ApiProperty({
    enum: EventStatus,
    example: EventStatus.PUBLISHED,
    description: 'Estado del evento.',
  })
  status: EventStatus;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/events/noche-indie-granada.jpg',
    description: 'URL de la imagen del evento.',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: 'EUR', description: 'Moneda del evento.' })
  currency: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID del creador del evento.',
  })
  creatorId: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00Z',
    description: 'Fecha de última actualización.',
  })
  updatedAt: Date;

  @ApiProperty({
    type: VenueDetailDto,
    description: 'Información completa del recinto.',
  })
  venue: VenueDetailDto;

  @ApiPropertyOptional({
    type: FormatDetailDto,
    description: 'Formato del concierto. Puede ser nulo.',
    nullable: true,
  })
  format: FormatDetailDto | null;

  @ApiProperty({
    type: [GenreSummaryDto],
    description: 'Lista de géneros musicales del evento.',
  })
  genres: GenreSummaryDto[];
}
