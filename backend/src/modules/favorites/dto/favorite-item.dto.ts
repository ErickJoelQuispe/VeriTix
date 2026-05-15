import { ApiProperty } from '@nestjs/swagger';
import { BuyerEventSummaryDto } from '../../events/dto/buyer-event-item.dto';

export class FavoriteItemDto {
  @ApiProperty({ description: 'Favorite record ID.' })
  id: string;

  @ApiProperty({ type: BuyerEventSummaryDto, description: 'Enriched event data.' })
  event: BuyerEventSummaryDto;

  @ApiProperty({ description: 'Timestamp when the favorite was created.' })
  createdAt: Date;
}
