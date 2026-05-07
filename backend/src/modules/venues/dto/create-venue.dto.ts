import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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

export class CreateVenueDto {
  @ApiProperty({
    example: 'Palacio de Congresos de Granada',
    description: 'Nombre del recinto.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'palacio-congresos-granada',
    description:
      'Slug único del recinto. Solo minúsculas, números y guiones. Ej: palacio-congresos-granada, plaza-toros-granada.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: palacio-congresos-granada)',
  })
  slug: string;

  @ApiProperty({
    example: 'Paseo del Violon s/n',
    description: 'Dirección del recinto.',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;

  @ApiProperty({
    example: 'Granada',
    description: 'Ciudad donde se ubica el recinto.',
  })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @ApiPropertyOptional({
    example: 'Andalucia',
    description: 'Estado o provincia donde se ubica el recinto.',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: 'ES',
    description: 'Código de país (ISO 3166-1 alpha-2). Por defecto "ES".',
    default: 'ES',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Capacidad máxima del recinto (número entero positivo).',
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  capacity?: number;

  @ApiPropertyOptional({
    enum: VenueType,
    example: VenueType.FORO,
    description:
      'Tipo de recinto. ESTADIO, ARENA, FORO, AUDITORIO, CLUB, TEATRO, AL_AIRE_LIBRE u OTRO. Por defecto FORO.',
  })
  @IsOptional()
  @IsEnum(VenueType)
  type?: VenueType;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/venues/palacio-congresos-granada.jpg',
    description: 'URL de la imagen del recinto.',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://www.pcgr.org',
    description: 'Sitio web del recinto.',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del sitio web no es válida' })
  website?: string;
}
