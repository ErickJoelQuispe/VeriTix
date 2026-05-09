import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de restablecimiento de contraseña recibido por email.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token no puede estar vacío' })
  token: string;

  @ApiProperty({
    example: 'NuevaContrasena123',
    description:
      'Nueva contraseña de al menos 8 caracteres. Debe contener una mayúscula, una minúscula y un número.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;
}
