import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../../generated/prisma/enums';

export class TicketListResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({
    example: 'a3f8e1d2b4c7...',
    description: 'Hash SHA256 único del ticket.',
  })
  hash: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.ACTIVE })
  status: TicketStatus;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  purchaseDate: Date;

  @ApiProperty({
    example: { name: 'Pista General', price: 75.0 },
    description: 'Tipo de ticket.',
  })
  ticketType: { name: string; price: number };

  @ApiProperty({
    example: {
      id: 'uuid-event-1',
      name: 'Granada Indie Night 2026',
      eventDate: '2026-09-19T21:00:00.000Z',
    },
    description: 'Evento al que pertenece el ticket.',
  })
  event: { id: string; name: string; eventDate: Date };

  @ApiProperty({ example: { id: 'uuid-order-item-1' } })
  orderItem: { id: string };
}
