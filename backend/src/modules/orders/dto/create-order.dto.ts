import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del tipo de ticket.',
  })
  @IsUUID('4', { message: 'El ticketTypeId debe ser un UUID válido' })
  ticketTypeId: string;

  @ApiProperty({
    example: 2,
    description: 'Cantidad de tickets a comprar (mínimo 1).',
    minimum: 1,
  })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del evento para el que se realiza la orden.',
  })
  @IsUUID('4', { message: 'El eventId debe ser un UUID válido' })
  eventId: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Lista de items de la orden (al menos 1).',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'La orden debe tener al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
