import { ApiProperty } from '@nestjs/swagger';

export class ToggleFavoriteResponseDto {
  @ApiProperty({
    description: 'Whether the event is now favorited (true) or unfavorited (false).',
    example: true,
  })
  favorited: boolean;
}
