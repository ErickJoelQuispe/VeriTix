import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsUUID } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ description: 'UUID of the ticket to transfer', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  ticketId: string;

  @ApiProperty({ description: 'Email address of the transfer recipient', example: 'recipient@example.com' })
  @IsEmail()
  recipientEmail: string;
}
