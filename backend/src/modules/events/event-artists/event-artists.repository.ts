import { Injectable } from '@nestjs/common';
import { ArtistRole } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddEventArtistDto } from './dto';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ArtistSummary = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  country: string | null;
};

export type EventArtistRecord = {
  id: string;
  role: ArtistRole;
  performanceOrder: number;
  performanceTime: Date | null;
  eventId: string;
  artist: ArtistSummary;
};

export type EventArtistBasic = {
  id: string;
  role: ArtistRole;
  performanceOrder: number;
  performanceTime: Date | null;
  eventId: string;
  artistId: string;
};

const ARTIST_INCLUDE = {
  artist: {
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      country: true,
    },
  },
} as const;

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class EventArtistsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEventId(eventId: string): Promise<EventArtistRecord[]> {
    return this.prisma.eventArtist.findMany({
      where: { eventId },
      orderBy: { performanceOrder: 'asc' },
      include: ARTIST_INCLUDE,
    }) as Promise<EventArtistRecord[]>;
  }

  findById(id: string): Promise<EventArtistBasic | null> {
    return this.prisma.eventArtist.findUnique({
      where: { id },
    }) as Promise<EventArtistBasic | null>;
  }

  create(data: AddEventArtistDto & { eventId: string }): Promise<EventArtistRecord> {
    return this.prisma.eventArtist.create({
      data: {
        eventId: data.eventId,
        artistId: data.artistId,
        role: data.role,
        performanceOrder: data.performanceOrder,
        performanceTime: data.performanceTime ? new Date(data.performanceTime) : null,
      },
      include: ARTIST_INCLUDE,
    }) as Promise<EventArtistRecord>;
  }

  delete(id: string): Promise<EventArtistBasic> {
    return this.prisma.eventArtist.delete({
      where: { id },
    }) as Promise<EventArtistBasic>;
  }
}
