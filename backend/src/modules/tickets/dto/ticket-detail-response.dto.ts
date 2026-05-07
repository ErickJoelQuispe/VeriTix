import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../../generated/prisma/enums';

export class TicketDetailResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'a3f8e1d2b4c7...', description: 'Hash SHA256 único.' })
  hash: string;

  @ApiProperty({
    example: 'a3f8e1d2b4c7...',
    description:
      'Payload del código QR. En modo online es igual al hash. Escanearlo para validar.',
  })
  qrPayload: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.ACTIVE })
  status: TicketStatus;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  purchaseDate: Date;

  @ApiPropertyOptional({
    example: '2026-09-19T21:35:00.000Z',
    nullable: true,
    description: 'Fecha y hora en que fue validado. Null si no fue usado aún.',
  })
  validatedAt: Date | null;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: { name: 'Pista General', price: 75.0 } })
  ticketType: { name: string; price: number };

  @ApiProperty({
    example: {
      id: 'uuid-event-1',
      name: 'Granada Indie Night 2026',
      eventDate: '2026-09-19T21:00:00.000Z',
    },
  })
  event: { id: string; name: string; eventDate: Date };

  @ApiProperty({ example: { id: 'uuid-order-item-1' } })
  orderItem: { id: string };

  @ApiProperty({
    example: { id: 'uuid-order-1', totalAmount: 150.0 },
    description: 'Orden asociada.',
  })
  order: { id: string; totalAmount: number };

  @ApiPropertyOptional({
    example: { name: 'Carlos', lastName: 'Martínez' },
    nullable: true,
    description: 'Validador que marcó el ticket como USED. Null si no fue validado.',
  })
  validatedBy: { name: string; lastName: string } | null;
}
