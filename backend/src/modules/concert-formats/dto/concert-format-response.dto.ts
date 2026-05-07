import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConcertFormatResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del formato de concierto (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'Concierto',
    description: 'Nombre del formato de concierto.',
  })
  name: string;

  @ApiProperty({
    example: 'concierto',
    description:
      'Slug único del formato de concierto (minúsculas, alfanumérico con guiones).',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Evento musical en vivo con uno o varios artistas.',
    description: 'Descripción del formato de concierto. Puede ser nula.',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    example: 'concert-icon',
    description: 'Identificador de ícono para el formato. Puede ser nulo.',
    nullable: true,
  })
  icon: string | null;
}
