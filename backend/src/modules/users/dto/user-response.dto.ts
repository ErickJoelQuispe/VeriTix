import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del usuario (UUID).',
  })
  id: string;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico del usuario.',
  })
  email: string;

  @ApiProperty({
    example: '+525512345678',
    description: 'Número de teléfono del usuario en formato E.164.',
  })
  phone: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre(s) del usuario.',
  })
  name: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido(s) del usuario.',
  })
  lastName: string;

  @ApiProperty({
    enum: Role,
    example: Role.BUYER,
    description:
      'Rol del usuario en la plataforma. BUYER = comprador, CREATOR = creador de eventos, VALIDATOR = validador de boletos, ADMIN = administrador.',
  })
  role: Role;

  @ApiProperty({
    example: 'https://cdn.veritix.com/avatars/usuario.jpg',
    description:
      'URL del avatar del usuario. Puede ser nulo si no ha subido foto.',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si la cuenta del usuario está activa.',
  })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description:
      'Indica si el correo electrónico del usuario ha sido verificado.',
  })
  emailVerified: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha y hora de creación del usuario.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-20T14:45:00Z',
    description: 'Fecha y hora de la última actualización del usuario.',
  })
  updatedAt: Date;
}
