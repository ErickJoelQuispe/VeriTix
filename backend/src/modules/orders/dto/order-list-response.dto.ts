import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../generated/prisma/enums';

export class OrderListResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '150.00', description: 'Monto total de la orden.' })
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: '2026-04-06T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Resumen del evento.',
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Noche Indie en Granada',
      eventDate: '2026-12-31T21:00:00Z',
    },
  })
  event: {
    id: string;
    name: string;
    eventDate: Date;
  };

  @ApiPropertyOptional({
    description: 'URL de pago de Stripe (solo presente si status es PENDING).',
    example: 'https://checkout.stripe.com/pay/cs_test_...',
    nullable: true,
  })
  checkoutUrl: string | null;
}
