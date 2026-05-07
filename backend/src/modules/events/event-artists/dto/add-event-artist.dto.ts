import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { ArtistRole } from '../../../../generated/prisma/enums';

export class AddEventArtistDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del artista.',
  })
  @IsUUID('4', { message: 'El artistaId debe ser un UUID válido' })
  artistId: string;

  @ApiProperty({
    enum: ArtistRole,
    example: ArtistRole.HEADLINER,
    description: 'Rol del artista en el evento.',
  })
  @IsEnum(ArtistRole, { message: 'El rol debe ser HEADLINER, SPECIAL_GUEST u OPENER' })
  role: ArtistRole;

  @ApiProperty({
    example: 1,
    description: 'Orden de presentación del artista.',
    minimum: 1,
  })
  @IsInt({ message: 'El orden de presentación debe ser un número entero' })
  @IsPositive({ message: 'El orden de presentación debe ser positivo' })
  performanceOrder: number;

  @ApiPropertyOptional({
    example: '2025-12-31T22:00:00Z',
    description: 'Hora de presentación del artista (ISO 8601).',
  })
  @IsOptional()
  @IsDateString()
  performanceTime?: string;
}
