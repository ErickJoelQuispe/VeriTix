import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TicketTypeResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del tipo de boleto (UUID).',
  })
  id: string;

  @ApiProperty({ example: 'General', description: 'Nombre del tipo de boleto.' })
  name: string;

  @ApiPropertyOptional({
    example: 'Acceso general al evento.',
    description: 'Descripción del tipo de boleto.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 350.0,
    description: 'Precio del boleto.',
  })
  price: number;

  @ApiProperty({
    example: 500,
    description: 'Cantidad total de boletos.',
  })
  totalQuantity: number;

  @ApiProperty({
    example: 450,
    description: 'Cantidad disponible de boletos.',
  })
  availableQuantity: number;

  @ApiProperty({
    example: 4,
    description: 'Máximo de boletos por usuario.',
  })
  maxPerUser: number;

  @ApiProperty({
    example: true,
    description: 'Indica si el tipo de boleto está activo.',
  })
  isActive: boolean;

  @ApiPropertyOptional({
    example: '2025-10-01T00:00:00Z',
    description: 'Fecha de inicio de venta.',
    nullable: true,
  })
  saleStartDate: Date | null;

  @ApiPropertyOptional({
    example: '2025-12-31T18:00:00Z',
    description: 'Fecha de fin de venta.',
    nullable: true,
  })
  saleEndDate: Date | null;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID del evento al que pertenece.',
  })
  eventId: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00Z',
    description: 'Fecha de última actualización.',
  })
  updatedAt: Date;
}
