import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'ContraseñaActual123',
    description: 'Contraseña actual del usuario.',
  })
  @IsString()
  currentPassword: string;

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
  newPassword: string;
}
