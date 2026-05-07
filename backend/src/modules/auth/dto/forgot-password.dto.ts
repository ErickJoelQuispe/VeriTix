import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico asociado a la cuenta.',
  })
  @IsEmail()
  email: string;
}
