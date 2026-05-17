import { ApiProperty } from '@nestjs/swagger';

export class ReviewAuthorDto {
  @ApiProperty({ description: 'Author first name.' })
  name: string;

  @ApiProperty({ description: 'Author last name.' })
  lastName: string;
}

export class ReviewItemDto {
  @ApiProperty({ description: 'Review ID.' })
  id: string;

  @ApiProperty({ description: 'Event ID the review belongs to.' })
  eventId: string;

  @ApiProperty({ description: 'Rating from 1 to 5.', minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ description: 'Review comment.' })
  comment: string;

  @ApiProperty({ type: ReviewAuthorDto, description: 'Author info (name only, no email).' })
  user: ReviewAuthorDto;

  @ApiProperty({ description: 'When the review was created.' })
  createdAt: Date;

  @ApiProperty({ description: 'When the review was last updated.' })
  updatedAt: Date;
}
