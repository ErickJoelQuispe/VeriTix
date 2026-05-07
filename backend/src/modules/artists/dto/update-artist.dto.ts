import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateArtistDto {
  @ApiPropertyOptional({
    example: 'Los Planetas',
    description: 'Nombre del artista.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiPropertyOptional({
    example: 'los-planetas',
    description: 'Slug único del artista. Solo minúsculas, números y guiones.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: los-planetas)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Banda indie rock originaria de Granada.',
    description: 'Biografía del artista. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/artists/los-planetas.jpg',
    description: 'URL de la imagen del artista. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'ES',
    description: 'País de origen del artista. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({
    example: 'https://www.losplanetas.net',
    description: 'Sitio web del artista. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  website?: string | null;

  @ApiPropertyOptional({
    example: true,
    description:
      'Indica si el artista está activo. Usar para reactivar un artista.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['uuid-genre-1', 'uuid-genre-2'],
    description:
      'IDs de los géneros musicales. Reemplaza completamente la lista actual de géneros.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];
}
