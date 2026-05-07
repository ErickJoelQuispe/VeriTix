import { ApiProperty } from '@nestjs/swagger';
import { VenueType } from '../../../generated/prisma/enums';

export class VenueResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del recinto (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'Palacio de Congresos de Granada',
    description: 'Nombre del recinto.',
  })
  name: string;

  @ApiProperty({
    example: 'palacio-congresos-granada',
    description:
      'Slug único del recinto (minúsculas, alfanumérico con guiones).',
  })
  slug: string;

  @ApiProperty({
    example: 'Paseo del Violon s/n',
    description: 'Dirección del recinto.',
  })
  address: string;

  @ApiProperty({
    example: 'Granada',
    description: 'Ciudad donde se ubica el recinto.',
  })
  city: string;

  @ApiProperty({
    example: 'Andalucia',
    description:
      'Estado o provincia donde se ubica el recinto. Puede ser nulo.',
    nullable: true,
  })
  state: string | null;

  @ApiProperty({
    example: 'ES',
    description: 'Código de país del recinto (ISO 3166-1 alpha-2).',
  })
  country: string;

  @ApiProperty({
    example: 2000,
    description: 'Capacidad máxima del recinto. Puede ser nula.',
    nullable: true,
  })
  capacity: number | null;

  @ApiProperty({
    enum: VenueType,
    example: VenueType.FORO,
    description:
      'Tipo de recinto. ESTADIO, ARENA, FORO, AUDITORIO, CLUB, TEATRO, AL_AIRE_LIBRE u OTRO.',
  })
  type: VenueType;

  @ApiProperty({
    example: true,
    description: 'Indica si el recinto está activo.',
  })
  isActive: boolean;

  @ApiProperty({
    example: 'https://cdn.veritix.com/venues/palacio-congresos-granada.jpg',
    description: 'URL de la imagen del recinto. Puede ser nula.',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: 'https://www.pcgr.org',
    description: 'Sitio web del recinto. Puede ser nulo.',
    nullable: true,
  })
  website: string | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha y hora de creación del recinto.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00Z',
    description: 'Fecha y hora de la última actualización del recinto.',
  })
  updatedAt: Date;
}
