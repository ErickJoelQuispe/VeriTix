import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateConcertFormatDto {
  @ApiPropertyOptional({
    example: 'Concierto',
    description: 'Nombre del formato de concierto.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  /**
   * Optional — if omitted the backend auto-generates it from `name`.
   */
  @ApiPropertyOptional({
    example: 'concierto',
    description:
      'Slug único del formato. Si se omite se genera automáticamente desde el nombre.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío si se proporciona' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: club-night)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Evento musical en vivo con uno o varios artistas.',
    description: 'Descripción del formato de concierto.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'concert-icon',
    description: 'Identificador de ícono para el formato.',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
