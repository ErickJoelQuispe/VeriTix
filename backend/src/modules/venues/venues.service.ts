import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import {
  CACHE_KEYS,
  CACHE_TTL_LONG,
  CacheService,
} from '../../cache';
import {
  CreateVenueDto,
  UpdateVenueDto,
  VenueQueryDto,
  VenueResponseDto,
} from './dto';
import { VenuesRepository } from './venues.repository';

@Injectable()
export class VenuesService {
  constructor(
    private readonly venuesRepository: VenuesRepository,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateVenueDto): Promise<VenueResponseDto> {
    const existingSlug = await this.venuesRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictException('El slug ya está en uso por otro recinto');
    }

    const created = await this.venuesRepository.create(dto);
    await this.cache.del(CACHE_KEYS.VENUES_LIST);
    return created as VenueResponseDto;
  }

  async findAll(
    query: VenueQueryDto,
  ): Promise<PaginatedResponse<VenueResponseDto>> {
    return this.cache.getOrSet(
      CACHE_KEYS.VENUES_LIST,
      () =>
        this.venuesRepository.findAll({
          page: query.page,
          limit: query.limit,
          city: query.city,
          type: query.type,
          isActive: query.isActive,
          search: query.search,
        }),
      CACHE_TTL_LONG,
    ) as Promise<PaginatedResponse<VenueResponseDto>>;
  }

  async findOne(id: string): Promise<VenueResponseDto> {
    return this.cache.getOrSet(
      CACHE_KEYS.VENUES_DETAIL(id),
      async () => {
        const venue = await this.venuesRepository.findById(id);
        if (!venue) throw new NotFoundException('Recinto no encontrado');
        return venue;
      },
      CACHE_TTL_LONG,
    ) as Promise<VenueResponseDto>;
  }

  async update(id: string, dto: UpdateVenueDto): Promise<VenueResponseDto> {
    const current = await this.venuesRepository.findById(id);
    if (!current) throw new NotFoundException('Recinto no encontrado');

    if (dto.slug && dto.slug !== current.slug) {
      const existingSlug = await this.venuesRepository.findBySlug(dto.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('El slug ya está en uso por otro recinto');
      }
    }

    const updated = await this.venuesRepository.update(id, dto);
    await Promise.all([
      this.cache.del(CACHE_KEYS.VENUES_LIST),
      this.cache.del(CACHE_KEYS.VENUES_DETAIL(id)),
    ]);
    return updated as VenueResponseDto;
  }

  async remove(id: string): Promise<void> {
    const venue = await this.venuesRepository.findById(id);
    if (!venue) throw new NotFoundException('Recinto no encontrado');

    await this.venuesRepository.softDelete(id);
    await Promise.all([
      this.cache.del(CACHE_KEYS.VENUES_LIST),
      this.cache.del(CACHE_KEYS.VENUES_DETAIL(id)),
    ]);
  }
}
