import { ApiProperty } from '@nestjs/swagger';

export class GenreSummaryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del género (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'Rock',
    description: 'Nombre del género.',
  })
  name: string;

  @ApiProperty({
    example: 'rock',
    description: 'Slug único del género.',
  })
  slug: string;
}

export class ArtistResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del artista (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'Los Planetas',
    description: 'Nombre del artista.',
  })
  name: string;

  @ApiProperty({
    example: 'los-planetas',
    description:
      'Slug único del artista (minúsculas, alfanumérico con guiones).',
  })
  slug: string;

  @ApiProperty({
    example: 'Banda indie rock originaria de Granada.',
    description: 'Biografía del artista. Puede ser nula.',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    example: 'https://cdn.veritix.com/artists/los-planetas.jpg',
    description: 'URL de la imagen del artista. Puede ser nula.',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: 'ES',
    description: 'País de origen del artista. Puede ser nulo.',
    nullable: true,
  })
  country: string | null;

  @ApiProperty({
    example: 'https://www.losplanetas.net',
    description: 'Sitio web del artista. Puede ser nulo.',
    nullable: true,
  })
  website: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si el artista está activo.',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha y hora de creación del artista.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00Z',
    description: 'Fecha y hora de la última actualización del artista.',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [GenreSummaryDto],
    description: 'Géneros musicales asociados al artista.',
  })
  genres: GenreSummaryDto[];
}
