import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
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
    example: 'https://cdn.veritix.com/avatars/usuario.jpg',
    description: 'URL del avatar del usuario.',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
