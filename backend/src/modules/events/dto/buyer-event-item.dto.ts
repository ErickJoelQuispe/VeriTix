import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../../generated/prisma/enums';

export class BuyerEventVenueDto {
  @ApiProperty({ example: 'uuid-venue-1' })
  id: string;

  @ApiProperty({ example: 'Foro Sol' })
  name: string;

  @ApiProperty({ example: 'Ciudad de México' })
  city: string;
}

export class BuyerEventFormatDto {
  @ApiProperty({ example: 'uuid-format-1' })
  id: string;

  @ApiProperty({ example: 'Festival' })
  name: string;
}

export class BuyerEventSummaryDto {
  @ApiProperty({ example: 'uuid-event-1' })
  id: string;

  @ApiProperty({ example: 'Rock en el Foro' })
  name: string;

  @ApiProperty({ example: '2025-12-31T21:00:00Z' })
  eventDate: Date;

  @ApiPropertyOptional({ example: 'https://cdn.veritix.com/events/event.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ type: BuyerEventVenueDto })
  venue: BuyerEventVenueDto;

  @ApiPropertyOptional({ type: BuyerEventFormatDto, nullable: true })
  format: BuyerEventFormatDto | null;
}

export class BuyerEventItemDto {
  @ApiProperty({ type: BuyerEventSummaryDto })
  event: BuyerEventSummaryDto;

  @ApiProperty({ example: 2, description: 'Number of tickets the buyer holds for this event.' })
  ticketCount: number;

  @ApiProperty({
    enum: TicketStatus,
    example: TicketStatus.ACTIVE,
    description: 'Dominant ticket status (ACTIVE > USED > CANCELLED = REFUNDED).',
  })
  dominantStatus: TicketStatus;
}
