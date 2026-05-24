import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import { CACHE_KEYS, CACHE_TTL_LONG, CacheService } from '../../cache';
import { generateSlug, uniqueSlug } from '../../common';
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

  private async getVenuesListCacheVersion(): Promise<number> {
    const version = await this.cache.get<number>(CACHE_KEYS.VENUES_LIST_VERSION);
    return Number.isInteger(version) && (version as number) > 0
      ? (version as number)
      : 1;
  }

  private async bumpVenuesListCacheVersion(): Promise<void> {
    const currentVersion = await this.getVenuesListCacheVersion();
    await this.cache.set(
      CACHE_KEYS.VENUES_LIST_VERSION,
      currentVersion + 1,
      CACHE_TTL_LONG,
    );
  }

  private buildVenuesListCacheKey(
    query: VenueQueryDto,
    version: number,
  ): string {
    return CACHE_KEYS.VENUES_LIST_QUERY(version, {
      page: query.page,
      limit: query.limit,
      city: query.city,
      type: query.type,
      isActive: query.isActive,
      search: query.search,
    });
  }

  async create(dto: CreateVenueDto): Promise<VenueResponseDto> {
    const baseSlug = dto.slug ?? generateSlug(dto.name);
    const slug = await uniqueSlug(
      baseSlug,
      (s: string) => this.venuesRepository.findBySlug(s).then(Boolean),
    );

    const created = await this.venuesRepository.create({ ...dto, slug });
    await Promise.all([
      this.cache.del(CACHE_KEYS.VENUES_LIST),
      this.bumpVenuesListCacheVersion(),
    ]);
    return created as VenueResponseDto;
  }

  async findAll(
    query: VenueQueryDto,
  ): Promise<PaginatedResponse<VenueResponseDto>> {
    const version = await this.getVenuesListCacheVersion();

    return this.cache.getOrSet(
      this.buildVenuesListCacheKey(query, version),
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
      this.bumpVenuesListCacheVersion(),
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
      this.bumpVenuesListCacheVersion(),
      this.cache.del(CACHE_KEYS.VENUES_DETAIL(id)),
    ]);
  }
}
