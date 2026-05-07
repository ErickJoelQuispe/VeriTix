import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../../../generated/prisma/enums';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 2, description: 'Cantidad de tickets.' })
  quantity: number;

  @ApiProperty({
    example: '75.00',
    description: 'Precio unitario al momento de la compra.',
  })
  unitPrice: number;

  @ApiProperty({ example: '150.00', description: 'Subtotal del item.' })
  subtotal: number;

  @ApiProperty({
    description: 'Tipo de ticket.',
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Pista General',
      price: '75.00',
    },
  })
  ticketType: {
    id: string;
    name: string;
    price: number;
  };
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '150.00' })
  amount: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ example: 'stripe' })
  provider: string;

  @ApiPropertyOptional({ example: 'pi_3OxxxxxxxxxxxY', nullable: true })
  providerPaymentId: string | null;

  @ApiPropertyOptional({ nullable: true })
  failureReason: string | null;

  @ApiPropertyOptional({ nullable: true })
  paidAt: Date | null;

  @ApiProperty({ example: '2026-04-06T10:00:00Z' })
  createdAt: Date;
}

export class OrderDetailResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '150.00', description: 'Monto total de la orden.' })
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: '2026-04-06T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-06T10:00:00Z' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Resumen del evento.',
  })
  event: {
    id: string;
    name: string;
    eventDate: Date;
    currency: string;
  };

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: 'Items de la orden.',
  })
  items: OrderItemResponseDto[];

  @ApiProperty({
    type: [PaymentResponseDto],
    description: 'Pagos asociados a la orden.',
  })
  payments: PaymentResponseDto[];

  @ApiPropertyOptional({
    description:
      'URL de pago de Stripe (solo si status es PENDING y hay sesión activa).',
    nullable: true,
  })
  checkoutUrl: string | null;
}
