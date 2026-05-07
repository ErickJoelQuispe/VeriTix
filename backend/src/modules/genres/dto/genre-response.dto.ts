import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenreResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del género musical (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'Rock',
    description: 'Nombre del género musical.',
  })
  name: string;

  @ApiProperty({
    example: 'rock',
    description:
      'Slug único del género musical (minúsculas, alfanumérico con guiones).',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Género musical caracterizado por el uso de guitarras eléctricas.',
    description: 'Descripción del género musical. Puede ser nula.',
    nullable: true,
  })
  description: string | null;
}
