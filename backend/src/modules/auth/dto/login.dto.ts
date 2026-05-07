import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico registrado.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Contrasena123!',
    description: 'Contraseña de la cuenta.',
  })
  @IsString()
  password: string;
}
