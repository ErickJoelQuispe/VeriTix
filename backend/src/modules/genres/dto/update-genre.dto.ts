import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateGenreDto {
  @ApiPropertyOptional({
    example: 'Rock',
    description: 'Nombre del género musical.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiPropertyOptional({
    example: 'rock',
    description: 'Slug único del género. Solo minúsculas, números y guiones.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: hip-hop)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Género musical caracterizado por el uso de guitarras eléctricas.',
    description: 'Descripción del género musical. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
