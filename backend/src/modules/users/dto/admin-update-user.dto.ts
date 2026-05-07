import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Nombre(s) del usuario.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Pérez',
    description: 'Apellido(s) del usuario.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  lastName?: string;

  @ApiPropertyOptional({
    example: '+34958123456',
    description: 'Número de teléfono en formato internacional E.164.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'El teléfono debe estar en formato E.164 (ej: +34958123456)',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico del usuario.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/avatars/usuario.jpg',
    description: 'URL del avatar del usuario. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.BUYER,
    description:
      'Rol del usuario. BUYER = comprador, CREATOR = creador de eventos, VALIDATOR = validador de boletos, ADMIN = administrador.',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la cuenta del usuario está activa.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'Indica si el correo electrónico del usuario ha sido verificado.',
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
