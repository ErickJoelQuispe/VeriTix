import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateArtistDto {
  @ApiProperty({
    example: 'Los Planetas',
    description: 'Nombre del artista.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'los-planetas',
    description:
      'Slug único del artista. Solo minúsculas, números y guiones. Ej: los-planetas.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: los-planetas)',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Banda indie rock originaria de Granada.',
    description: 'Biografía del artista.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/artists/los-planetas.jpg',
    description: 'URL de la imagen del artista.',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'ES',
    description: 'País de origen del artista (código ISO 3166-1 alpha-2).',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'https://www.losplanetas.net',
    description: 'Sitio web del artista.',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    example: ['uuid-genre-1', 'uuid-genre-2'],
    description: 'IDs de los géneros musicales a asociar al artista.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];
}
