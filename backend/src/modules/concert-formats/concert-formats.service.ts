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
import {
  ConcertFormatResponseDto,
  CreateConcertFormatDto,
  UpdateConcertFormatDto,
} from './dto';
import { ConcertFormatsRepository } from './concert-formats.repository';

@Injectable()
export class ConcertFormatsService {
  constructor(
    private readonly concertFormatsRepository: ConcertFormatsRepository,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateConcertFormatDto): Promise<ConcertFormatResponseDto> {
    const existingSlug = await this.concertFormatsRepository.findBySlug(
      dto.slug,
    );
    if (existingSlug) {
      throw new ConflictException(
        'El slug ya está en uso por otro formato de concierto',
      );
    }

    const existingName = await this.concertFormatsRepository.findByName(
      dto.name,
    );
    if (existingName) {
      throw new ConflictException(
        'El nombre ya está en uso por otro formato de concierto',
      );
    }

    const created = await this.concertFormatsRepository.create(dto);
    await this.cache.del(CACHE_KEYS.FORMATS_LIST);
    return created as ConcertFormatResponseDto;
  }

  async findAll(): Promise<ConcertFormatResponseDto[]> {
    return this.cache.getOrSet(
      CACHE_KEYS.FORMATS_LIST,
      () => this.concertFormatsRepository.findAll(),
      CACHE_TTL_LONG,
    ) as Promise<ConcertFormatResponseDto[]>;
  }

  async findOne(id: string): Promise<ConcertFormatResponseDto> {
    const format = await this.concertFormatsRepository.findById(id);
    if (!format) {
      throw new NotFoundException('Formato de concierto no encontrado');
    }
    return format as ConcertFormatResponseDto;
  }

  async update(
    id: string,
    dto: UpdateConcertFormatDto,
  ): Promise<ConcertFormatResponseDto> {
    const current = await this.concertFormatsRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Formato de concierto no encontrado');
    }

    if (dto.slug && dto.slug !== current.slug) {
      const existingSlug = await this.concertFormatsRepository.findBySlug(
        dto.slug,
      );
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          'El slug ya está en uso por otro formato de concierto',
        );
      }
    }

    if (dto.name && dto.name !== current.name) {
      const existingName = await this.concertFormatsRepository.findByName(
        dto.name,
      );
      if (existingName && existingName.id !== id) {
        throw new ConflictException(
          'El nombre ya está en uso por otro formato de concierto',
        );
      }
    }

    const updated = await this.concertFormatsRepository.update(id, dto);
    await this.cache.del(CACHE_KEYS.FORMATS_LIST);
    return updated as ConcertFormatResponseDto;
  }

  async remove(id: string): Promise<void> {
    const format = await this.concertFormatsRepository.findById(id);
    if (!format) {
      throw new NotFoundException('Formato de concierto no encontrado');
    }

    await this.concertFormatsRepository.delete(id);
    await this.cache.del(CACHE_KEYS.FORMATS_LIST);
  }
}
