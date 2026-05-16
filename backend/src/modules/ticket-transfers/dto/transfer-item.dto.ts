import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferSenderDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
}

export class TransferItemDto {
  @ApiProperty() id: string;
  @ApiProperty() ticketId: string;
  @ApiProperty() senderId: string;
  @ApiProperty() recipientEmail: string;
  @ApiPropertyOptional() recipientUserId?: string | null;
  @ApiProperty() token: string;
  @ApiProperty({ enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'] }) status: string;
  @ApiProperty() expiresAt: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiPropertyOptional({ type: () => TransferSenderDto }) sender?: TransferSenderDto;
}
