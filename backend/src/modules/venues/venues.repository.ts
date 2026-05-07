import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { VenueType } from '../../generated/prisma/enums';
import type {
  VenueGetPayload,
  VenueWhereInput,
} from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

export const VENUE_SELECT = {
  id: true,
  name: true,
  slug: true,
  address: true,
  city: true,
  state: true,
  country: true,
  capacity: true,
  type: true,
  isActive: true,
  imageUrl: true,
  website: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type VenueSafe = VenueGetPayload<{ select: typeof VENUE_SELECT }>;

export type CreateVenueData = {
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  capacity?: number;
  type?: VenueType;
  imageUrl?: string;
  website?: string;
};

export type UpdateVenueData = Partial<{
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  capacity: number | null;
  type: VenueType;
  isActive: boolean;
  imageUrl: string | null;
  website: string | null;
}>;

export type FindAllVenuesParams = {
  page: number;
  limit: number;
  city?: string;
  type?: VenueType;
  isActive?: boolean;
  search?: string;
};

@Injectable()
export class VenuesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAll(
    params: FindAllVenuesParams,
  ): Promise<PaginatedResponse<VenueSafe>> {
    const { page, limit, city, type, isActive, search } = params;

    const where: VenueWhereInput = {};

    if (city !== undefined)
      where.city = { contains: city, mode: 'insensitive' };
    if (type !== undefined) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        select: VENUE_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  findById(id: string): Promise<VenueSafe | null> {
    return this.prisma.venue.findUnique({
      where: { id },
      select: VENUE_SELECT,
    });
  }

  findBySlug(slug: string): Promise<VenueSafe | null> {
    return this.prisma.venue.findUnique({
      where: { slug },
      select: VENUE_SELECT,
    });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  create(data: CreateVenueData): Promise<VenueSafe> {
    return this.prisma.venue.create({ data, select: VENUE_SELECT });
  }

  update(id: string, data: UpdateVenueData): Promise<VenueSafe> {
    return this.prisma.venue.update({
      where: { id },
      data,
      select: VENUE_SELECT,
    });
  }

  softDelete(id: string): Promise<VenueSafe> {
    return this.prisma.venue.update({
      where: { id },
      data: { isActive: false },
      select: VENUE_SELECT,
    });
  }
}
