import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtistRole } from '../../../../generated/prisma/enums';

export class ArtistSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Coldplay' })
  name: string;

  @ApiProperty({ example: 'coldplay' })
  slug: string;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/artists/coldplay.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiPropertyOptional({ example: 'GB', nullable: true })
  country: string | null;
}

export class EventArtistResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identificador único del evento-artista (UUID).',
  })
  id: string;

  @ApiProperty({
    enum: ArtistRole,
    example: ArtistRole.HEADLINER,
    description: 'Rol del artista en el evento.',
  })
  role: ArtistRole;

  @ApiProperty({
    example: 1,
    description: 'Orden de presentación.',
  })
  performanceOrder: number;

  @ApiPropertyOptional({
    example: '2025-12-31T22:00:00Z',
    description: 'Hora de presentación.',
    nullable: true,
  })
  performanceTime: Date | null;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID del evento.',
  })
  eventId: string;

  @ApiProperty({
    type: ArtistSummaryDto,
    description: 'Información del artista.',
  })
  artist: ArtistSummaryDto;
}
