import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import { CACHE_KEYS, CACHE_TTL_LONG, CacheService } from '../../cache';
import { generateSlug, uniqueSlug } from '../../common';
import {
  ArtistQueryDto,
  ArtistResponseDto,
  CreateArtistDto,
  UpdateArtistDto,
} from './dto';
import { ArtistsRepository } from './artists.repository';

@Injectable()
export class ArtistsService {
  constructor(
    private readonly artistsRepository: ArtistsRepository,
    private readonly cache: CacheService,
  ) {}

  private async getArtistsListCacheVersion(): Promise<number> {
    const version = await this.cache.get<number>(CACHE_KEYS.ARTISTS_LIST_VERSION);
    return Number.isInteger(version) && (version as number) > 0
      ? (version as number)
      : 1;
  }

  private async bumpArtistsListCacheVersion(): Promise<void> {
    const currentVersion = await this.getArtistsListCacheVersion();
    await this.cache.set(
      CACHE_KEYS.ARTISTS_LIST_VERSION,
      currentVersion + 1,
      CACHE_TTL_LONG,
    );
  }

  private buildArtistsListCacheKey(
    query: ArtistQueryDto,
    version: number,
  ): string {
    return CACHE_KEYS.ARTISTS_LIST_QUERY(version, {
      page: query.page,
      limit: query.limit,
      genreId: query.genreId,
      country: query.country,
      isActive: query.isActive,
      search: query.search,
    });
  }

  async create(dto: CreateArtistDto): Promise<ArtistResponseDto> {
    const baseSlug = dto.slug ?? generateSlug(dto.name);
    const slug = await uniqueSlug(
      baseSlug,
      (s: string) => this.artistsRepository.findBySlug(s).then(Boolean),
    );

    const created = await this.artistsRepository.create({ ...dto, slug });
    await Promise.all([
      this.cache.del(CACHE_KEYS.ARTISTS_LIST),
      this.bumpArtistsListCacheVersion(),
    ]);
    return created as ArtistResponseDto;
  }

  async findAll(
    query: ArtistQueryDto,
  ): Promise<PaginatedResponse<ArtistResponseDto>> {
    const version = await this.getArtistsListCacheVersion();
    return this.cache.getOrSet(
      this.buildArtistsListCacheKey(query, version),
      () =>
        this.artistsRepository.findAll({
          page: query.page,
          limit: query.limit,
          genreId: query.genreId,
          country: query.country,
          isActive: query.isActive,
          search: query.search,
        }),
      CACHE_TTL_LONG,
    ) as Promise<PaginatedResponse<ArtistResponseDto>>;
  }

  async findOne(idOrSlug: string): Promise<ArtistResponseDto> {
    return this.cache.getOrSet(
      CACHE_KEYS.ARTISTS_DETAIL(idOrSlug),
      async () => {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        const artist = isUuid
          ? await this.artistsRepository.findById(idOrSlug)
          : await this.artistsRepository.findBySlug(idOrSlug);
        if (!artist) throw new NotFoundException('Artista no encontrado');
        return artist;
      },
      CACHE_TTL_LONG,
    ) as Promise<ArtistResponseDto>;
  }

  async update(id: string, dto: UpdateArtistDto): Promise<ArtistResponseDto> {
    const current = await this.artistsRepository.findById(id);
    if (!current) throw new NotFoundException('Artista no encontrado');

    if (dto.slug && dto.slug !== current.slug) {
      const existingSlug = await this.artistsRepository.findBySlug(dto.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('El slug ya está en uso por otro artista');
      }
    }

    const updated = await this.artistsRepository.update(id, dto);
    await Promise.all([
      this.cache.del(CACHE_KEYS.ARTISTS_LIST),
      this.bumpArtistsListCacheVersion(),
      this.cache.del(CACHE_KEYS.ARTISTS_DETAIL(id)),
    ]);
    return updated as ArtistResponseDto;
  }

  async remove(id: string): Promise<void> {
    const artist = await this.artistsRepository.findById(id);
    if (!artist) throw new NotFoundException('Artista no encontrado');

    await this.artistsRepository.softDelete(id);
    await Promise.all([
      this.cache.del(CACHE_KEYS.ARTISTS_LIST),
      this.bumpArtistsListCacheVersion(),
      this.cache.del(CACHE_KEYS.ARTISTS_DETAIL(id)),
    ]);
  }
}
