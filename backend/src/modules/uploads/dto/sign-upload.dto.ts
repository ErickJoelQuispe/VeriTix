import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUploadDto {
  @ApiProperty({ enum: ['events', 'artists', 'venues'] })
  @IsIn(['events', 'artists', 'venues'])
  folder: 'events' | 'artists' | 'venues';
}
