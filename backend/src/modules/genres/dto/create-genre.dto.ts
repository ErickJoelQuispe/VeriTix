import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateGenreDto {
  @ApiPropertyOptional({
    example: 'Rock',
    description: 'Nombre del género musical.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  /**
   * Optional — if omitted the backend auto-generates it from `name`.
   * When provided it must match the slug format.
   */
  @ApiPropertyOptional({
    example: 'rock',
    description:
      'Slug único del género. Si se omite se genera automáticamente desde el nombre.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío si se proporciona' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: hip-hop)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Género musical caracterizado por el uso de guitarras eléctricas.',
    description: 'Descripción del género musical.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
