import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class AdminCreateUserDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico único del usuario.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+525512345678',
    description: 'Número de teléfono único en formato internacional E.164.',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'El teléfono debe estar en formato E.164 (ej: +525512345678)',
  })
  phone: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre(s) del usuario.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido(s) del usuario.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @ApiProperty({
    example: 'Contrasena123',
    description:
      'Contraseña de al menos 8 caracteres. Debe contener una mayúscula, una minúscula y un número.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.BUYER,
    description:
      'Rol del usuario. Por defecto es BUYER. BUYER = comprador, CREATOR = creador de eventos, VALIDATOR = validador de boletos, ADMIN = administrador.',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.BUYER;
}
