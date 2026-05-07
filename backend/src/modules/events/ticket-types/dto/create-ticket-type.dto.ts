import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateTicketTypeDto {
  @ApiProperty({
    example: 'General',
    description: 'Nombre del tipo de boleto.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiPropertyOptional({
    example: 'Acceso general al evento.',
    description: 'Descripción del tipo de boleto.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 350.0,
    description: 'Precio del boleto (número positivo).',
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @ApiProperty({
    example: 500,
    description: 'Cantidad total de boletos disponibles.',
    minimum: 1,
  })
  @IsInt({ message: 'La cantidad total debe ser un número entero' })
  @IsPositive({ message: 'La cantidad total debe ser positiva' })
  totalQuantity: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Máximo de boletos por usuario (por defecto 4).',
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El máximo por usuario debe ser un número entero' })
  @IsPositive({ message: 'El máximo por usuario debe ser positivo' })
  maxPerUser?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el tipo de boleto está activo.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2025-10-01T00:00:00Z',
    description: 'Fecha de inicio de venta (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  saleStartDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T18:00:00Z',
    description: 'Fecha de fin de venta (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  saleEndDate?: string;
}
