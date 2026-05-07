import { Injectable } from '@nestjs/common';
import type { GenreModel } from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateGenreData = {
  name: string;
  slug: string;
  description?: string;
};

export type UpdateGenreData = Partial<{
  name: string;
  slug: string;
  description: string | null;
}>;

@Injectable()
export class GenresRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  findAll(): Promise<GenreModel[]> {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string): Promise<GenreModel | null> {
    return this.prisma.genre.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<GenreModel | null> {
    return this.prisma.genre.findUnique({ where: { slug } });
  }

  findByName(name: string): Promise<GenreModel | null> {
    return this.prisma.genre.findUnique({ where: { name } });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  create(data: CreateGenreData): Promise<GenreModel> {
    return this.prisma.genre.create({ data });
  }

  update(id: string, data: UpdateGenreData): Promise<GenreModel> {
    return this.prisma.genre.update({ where: { id }, data });
  }

  delete(id: string): Promise<GenreModel> {
    return this.prisma.genre.delete({ where: { id } });
  }
}
