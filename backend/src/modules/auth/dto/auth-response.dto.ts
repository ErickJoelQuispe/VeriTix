import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

export class AuthUserDto {
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
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Token JWT de acceso. Enviarlo en el header Authorization: Bearer <token> para rutas protegidas.',
  })
  accessToken: string;

  @ApiProperty({
    type: AuthUserDto,
    description: 'Datos públicos del usuario autenticado (sin contraseña).',
  })
  user: AuthUserDto;
}
