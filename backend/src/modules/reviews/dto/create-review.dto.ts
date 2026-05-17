import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'UUID of the event being reviewed.', format: 'uuid' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ description: 'Rating from 1 (worst) to 5 (best).', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review comment (1–1000 characters).',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  comment: string;
}
