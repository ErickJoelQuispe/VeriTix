import { ApiProperty } from '@nestjs/swagger';

export class SignUploadResponseDto {
  @ApiProperty() signature: string; // SHA1 hex — 40 chars
  @ApiProperty() timestamp: number; // Unix timestamp en segundos
  @ApiProperty() apiKey: string; // CLOUDINARY_API_KEY
  @ApiProperty() cloudName: string; // CLOUDINARY_CLOUD_NAME
  @ApiProperty() folder: string; // el folder recibido
}
