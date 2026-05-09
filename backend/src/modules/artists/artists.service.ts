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

  async create(dto: CreateArtistDto): Promise<ArtistResponseDto> {
    const existingSlug = await this.artistsRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictException('El slug ya está en uso por otro artista');
    }

    const created = await this.artistsRepository.create(dto);
    // No invalidamos el list — TTL de 1h es aceptable para un nuevo artista
    // que aún no aparece en ninguna página cacheada
    return created as ArtistResponseDto;
  }

  async findAll(
    query: ArtistQueryDto,
  ): Promise<PaginatedResponse<ArtistResponseDto>> {
    const key = CACHE_KEYS.ARTISTS_LIST(query as unknown as Record<string, unknown>);
    return this.cache.getOrSet(
      key,
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

  async findOne(id: string): Promise<ArtistResponseDto> {
    return this.cache.getOrSet(
      CACHE_KEYS.ARTISTS_DETAIL(id),
      async () => {
        const artist = await this.artistsRepository.findById(id);
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
    await this.cache.del(CACHE_KEYS.ARTISTS_DETAIL(id));
    return updated as ArtistResponseDto;
  }

  async remove(id: string): Promise<void> {
    const artist = await this.artistsRepository.findById(id);
    if (!artist) throw new NotFoundException('Artista no encontrado');

    await this.artistsRepository.softDelete(id);
    await this.cache.del(CACHE_KEYS.ARTISTS_DETAIL(id));
  }
}
