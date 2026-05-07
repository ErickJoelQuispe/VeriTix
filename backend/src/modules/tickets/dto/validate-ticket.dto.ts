import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateTicketDto {
  @ApiProperty({
    example: '24a9f1b3e7c0d2f5:8ab3c12ef4d56789abcdef01:a3f8e1d2b4c7f9a2e6d1b8f3',
    description:
      'Payload cifrado AES-256-GCM del QR del ticket. Formato: iv:authTag:ciphertext (todo en hex, separado por ":").',
  })
  @IsString()
  payload: string;
}

export class ValidateTicketResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  ticketId: string;

  @ApiProperty({ example: 'Granada Indie Night 2026' })
  eventName: string;

  @ApiProperty({ example: 'Pista General' })
  ticketTypeName: string;

  @ApiProperty({ example: 'Ana García' })
  buyerName: string;

  @ApiProperty({ example: '2026-09-19T21:35:00.000Z' })
  validatedAt: Date;
}
