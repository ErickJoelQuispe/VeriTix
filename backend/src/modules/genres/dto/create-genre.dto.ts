import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({
    example: 'Rock',
    description: 'Nombre del género musical.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'rock',
    description:
      'Slug único del género. Solo minúsculas, números y guiones. Ej: rock, pop, hip-hop.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: hip-hop)',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Género musical caracterizado por el uso de guitarras eléctricas.',
    description: 'Descripción del género musical.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
