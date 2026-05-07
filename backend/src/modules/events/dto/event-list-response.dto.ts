import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../../../generated/prisma/enums';

export class VenueSummaryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del recinto.',
  })
  id: string;

  @ApiProperty({
    example: 'Palacio de Congresos de Granada',
    description: 'Nombre del recinto.',
  })
  name: string;

  @ApiProperty({
    example: 'Granada',
    description: 'Ciudad del recinto.',
  })
  city: string;
}

export class FormatSummaryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del formato.',
  })
  id: string;

  @ApiProperty({
    example: 'Festival',
    description: 'Nombre del formato del concierto.',
  })
  name: string;
}

export class EventListResponseDto {
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

  @ApiProperty({
    example: '2025-12-31T21:00:00Z',
    description: 'Fecha y hora del evento.',
  })
  eventDate: Date;

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

  @ApiProperty({
    example: 'EUR',
    description: 'Moneda del evento.',
  })
  currency: string;

  @ApiProperty({
    type: VenueSummaryDto,
    description: 'Información resumida del recinto.',
  })
  venue: VenueSummaryDto;

  @ApiPropertyOptional({
    type: FormatSummaryDto,
    description: 'Formato del concierto. Puede ser nulo.',
    nullable: true,
  })
  format: FormatSummaryDto | null;
}
