import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { VenueType } from '../../../generated/prisma/enums';

export class VenueQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Granada',
    description:
      'Filtrar por ciudad (búsqueda parcial, insensible a mayúsculas).',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    enum: VenueType,
    example: VenueType.FORO,
    description:
      'Filtrar por tipo de recinto. ESTADIO, ARENA, FORO, AUDITORIO, CLUB, TEATRO, AL_AIRE_LIBRE u OTRO.',
  })
  @IsOptional()
  @IsEnum(VenueType)
  type?: VenueType;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Filtrar por estado activo del recinto (true/false).',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'Palacio de Congresos',
    description: 'Buscar por nombre o dirección (búsqueda parcial).',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
