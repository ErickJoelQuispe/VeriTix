import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
} from 'class-validator';
import { VenueType } from '../../../generated/prisma/enums';

export class UpdateVenueDto {
  @ApiPropertyOptional({
    example: 'Palacio de Congresos de Granada',
    description: 'Nombre del recinto.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiPropertyOptional({
    example: 'palacio-congresos-granada',
    description: 'Slug único del recinto. Solo minúsculas, números y guiones.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: palacio-congresos-granada)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Paseo del Violon s/n',
    description: 'Dirección del recinto.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  address?: string;

  @ApiPropertyOptional({
    example: 'Granada',
    description: 'Ciudad donde se ubica el recinto.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La ciudad no puede estar vacía' })
  city?: string;

  @ApiPropertyOptional({
    example: 'Andalucia',
    description:
      'Estado o provincia donde se ubica el recinto. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional({
    example: 'ES',
    description: 'Código de país (ISO 3166-1 alpha-2).',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Capacidad máxima del recinto. Puede ser nulo.',
    nullable: true,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  capacity?: number | null;

  @ApiPropertyOptional({
    enum: VenueType,
    example: VenueType.FORO,
    description:
      'Tipo de recinto. ESTADIO, ARENA, FORO, AUDITORIO, CLUB, TEATRO, AL_AIRE_LIBRE u OTRO.',
  })
  @IsOptional()
  @IsEnum(VenueType)
  type?: VenueType;

  @ApiPropertyOptional({
    example: true,
    description:
      'Indica si el recinto está activo. Usar para reactivar un recinto.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/venues/palacio-congresos-granada.jpg',
    description: 'URL de la imagen del recinto. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'https://www.pcgr.org',
    description: 'Sitio web del recinto. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del sitio web no es válida' })
  website?: string | null;
}
