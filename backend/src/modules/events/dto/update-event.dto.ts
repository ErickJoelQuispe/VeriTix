import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({
    example: 'Noche Indie en Granada 2025',
    description: 'Nombre del evento.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Una noche épica de rock en vivo.',
    description: 'Descripción detallada del evento.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T21:00:00Z',
    description: 'Fecha y hora del evento (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T19:30:00Z',
    description: 'Hora de apertura de puertas (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  doorsOpenTime?: string;

  @ApiPropertyOptional({
    example: '2025-10-01T00:00:00Z',
    description: 'Inicio de la venta de boletos (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  startSale?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T18:00:00Z',
    description: 'Fin de la venta de boletos (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  endSale?: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Capacidad máxima del evento (entero positivo).',
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'La capacidad máxima debe ser un número entero' })
  @IsPositive({ message: 'La capacidad máxima debe ser un número positivo' })
  maxCapacity?: number;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/events/noche-indie-granada.jpg',
    description: 'URL de la imagen del evento.',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'EUR',
    description: 'Moneda del evento (código ISO 4217).',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del recinto donde se realizará el evento.',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El venueId debe ser un UUID válido' })
  venueId?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del formato del concierto.',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El formatId debe ser un UUID válido' })
  formatId?: string;

  @ApiPropertyOptional({
    example: ['uuid-genre-1', 'uuid-genre-2'],
    description:
      'Lista de UUIDs de géneros musicales del evento. Reemplaza los géneros existentes.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada genreId debe ser un UUID válido' })
  genreIds?: string[];
}
