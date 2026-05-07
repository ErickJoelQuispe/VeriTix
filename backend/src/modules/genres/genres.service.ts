import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CACHE_KEYS,
  CACHE_TTL_LONG,
  CacheService,
} from '../../cache';
import { CreateGenreDto, GenreResponseDto, UpdateGenreDto } from './dto';
import { GenresRepository } from './genres.repository';

@Injectable()
export class GenresService {
  constructor(
    private readonly genresRepository: GenresRepository,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateGenreDto): Promise<GenreResponseDto> {
    const existingSlug = await this.genresRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictException('El slug ya está en uso por otro género');
    }

    const existingName = await this.genresRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictException('El nombre ya está en uso por otro género');
    }

    const created = await this.genresRepository.create(dto);
    await this.cache.del(CACHE_KEYS.GENRES_LIST);
    return created as GenreResponseDto;
  }

  async findAll(): Promise<GenreResponseDto[]> {
    return this.cache.getOrSet(
      CACHE_KEYS.GENRES_LIST,
      () => this.genresRepository.findAll(),
      CACHE_TTL_LONG,
    ) as Promise<GenreResponseDto[]>;
  }

  async findOne(id: string): Promise<GenreResponseDto> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Género no encontrado');
    return genre as GenreResponseDto;
  }

  async update(id: string, dto: UpdateGenreDto): Promise<GenreResponseDto> {
    const current = await this.genresRepository.findById(id);
    if (!current) throw new NotFoundException('Género no encontrado');

    if (dto.slug && dto.slug !== current.slug) {
      const existingSlug = await this.genresRepository.findBySlug(dto.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('El slug ya está en uso por otro género');
      }
    }

    if (dto.name && dto.name !== current.name) {
      const existingName = await this.genresRepository.findByName(dto.name);
      if (existingName && existingName.id !== id) {
        throw new ConflictException('El nombre ya está en uso por otro género');
      }
    }

    const updated = await this.genresRepository.update(id, dto);
    await this.cache.del(CACHE_KEYS.GENRES_LIST);
    return updated as GenreResponseDto;
  }

  async remove(id: string): Promise<void> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Género no encontrado');

    await this.genresRepository.delete(id);
    await this.cache.del(CACHE_KEYS.GENRES_LIST);
  }
}
