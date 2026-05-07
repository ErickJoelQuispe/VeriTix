import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';

export class ArtistQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Filtrar por ID de género musical.',
  })
  @IsOptional()
  @IsUUID()
  genreId?: string;

  @ApiPropertyOptional({
    example: 'ES',
    description: 'Filtrar por país de origen (coincidencia exacta).',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'Planetas',
    description: 'Buscar por nombre del artista (búsqueda parcial).',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Filtrar por estado activo del artista (true/false).',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
