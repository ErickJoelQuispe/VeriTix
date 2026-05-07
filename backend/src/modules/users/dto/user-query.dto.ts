import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { Role } from '../../../generated/prisma/enums';

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: Role,
    example: Role.BUYER,
    description:
      'Filtrar por rol del usuario. BUYER = comprador, CREATOR = creador de eventos, VALIDATOR = validador de boletos, ADMIN = administrador.',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Filtrar por estado activo del usuario (true/false).',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Buscar por nombre o correo electrónico (búsqueda parcial).',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
