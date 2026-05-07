import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateConcertFormatDto {
  @ApiPropertyOptional({
    example: 'Concierto',
    description: 'Nombre del formato de concierto.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiPropertyOptional({
    example: 'concierto',
    description: 'Slug único del formato. Solo minúsculas, números y guiones.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: club-night)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Evento musical en vivo con uno o varios artistas.',
    description: 'Descripción del formato de concierto. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'concert-icon',
    description: 'Identificador de ícono para el formato. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  icon?: string | null;
}
