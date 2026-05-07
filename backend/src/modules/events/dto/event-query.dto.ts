import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';

export class EventQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Granada',
    description:
      'Filtrar por ciudad del recinto (búsqueda parcial, insensible a mayúsculas).',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Filtrar por UUID de género musical.',
  })
  @IsOptional()
  @IsUUID('4')
  genreId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Filtrar por UUID del formato del concierto.',
  })
  @IsOptional()
  @IsUUID('4')
  formatId?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filtrar eventos a partir de esta fecha (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Filtrar eventos hasta esta fecha (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    example: 'Noche Indie',
    description:
      'Buscar por nombre del evento (búsqueda parcial, insensible a mayúsculas).',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'The Killers',
    description:
      'Filtrar por nombre de artista (búsqueda parcial, insensible a mayúsculas).',
  })
  @IsOptional()
  @IsString()
  artistName?: string;
}
