import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import type { ArtistWhereInput } from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

export const ARTIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  bio: true,
  imageUrl: true,
  country: true,
  website: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  genres: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

export type ArtistSafe = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  imageUrl: string | null;
  country: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  genres: { id: string; name: string; slug: string }[];
};

export type CreateArtistData = {
  name: string;
  slug: string;
  bio?: string;
  imageUrl?: string;
  country?: string;
  website?: string;
  genreIds?: string[];
};

export type UpdateArtistData = Partial<{
  name: string;
  slug: string;
  bio: string | null;
  imageUrl: string | null;
  country: string | null;
  website: string | null;
  isActive: boolean;
  genreIds: string[];
}>;

export type FindAllArtistsParams = {
  page: number;
  limit: number;
  genreId?: string;
  country?: string;
  isActive?: boolean;
  search?: string;
};

@Injectable()
export class ArtistsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAll(
    params: FindAllArtistsParams,
  ): Promise<PaginatedResponse<ArtistSafe>> {
    const { page, limit, genreId, country, isActive, search } = params;

    const where: ArtistWhereInput = {};

    if (genreId !== undefined) where.genres = { some: { id: genreId } };
    if (country !== undefined) where.country = country;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.artist.findMany({
        where,
        select: ARTIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artist.count({ where }),
    ]);

    return createPaginatedResponse(data as ArtistSafe[], total, page, limit);
  }

  findById(id: string): Promise<ArtistSafe | null> {
    return this.prisma.artist.findUnique({
      where: { id },
      select: ARTIST_SELECT,
    }) as Promise<ArtistSafe | null>;
  }

  findBySlug(slug: string): Promise<ArtistSafe | null> {
    return this.prisma.artist.findUnique({
      where: { slug },
      select: ARTIST_SELECT,
    }) as Promise<ArtistSafe | null>;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  create(data: CreateArtistData): Promise<ArtistSafe> {
    const { genreIds, ...rest } = data;
    return this.prisma.artist.create({
      data: {
        ...rest,
        ...(genreIds && genreIds.length > 0
          ? { genres: { connect: genreIds.map((id) => ({ id })) } }
          : {}),
      },
      select: ARTIST_SELECT,
    }) as Promise<ArtistSafe>;
  }

  update(id: string, data: UpdateArtistData): Promise<ArtistSafe> {
    const { genreIds, ...rest } = data;
    return this.prisma.artist.update({
      where: { id },
      data: {
        ...rest,
        ...(genreIds !== undefined
          ? { genres: { set: genreIds.map((gid) => ({ id: gid })) } }
          : {}),
      },
      select: ARTIST_SELECT,
    }) as Promise<ArtistSafe>;
  }

  softDelete(id: string): Promise<ArtistSafe> {
    return this.prisma.artist.update({
      where: { id },
      data: { isActive: false },
      select: ARTIST_SELECT,
    }) as Promise<ArtistSafe>;
  }
}
