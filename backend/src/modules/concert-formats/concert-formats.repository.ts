import { Injectable } from '@nestjs/common';
import type { ConcertFormatModel } from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateConcertFormatData = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
};

export type UpdateConcertFormatData = Partial<{
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}>;

@Injectable()
export class ConcertFormatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  findAll(): Promise<ConcertFormatModel[]> {
    return this.prisma.concertFormat.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string): Promise<ConcertFormatModel | null> {
    return this.prisma.concertFormat.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<ConcertFormatModel | null> {
    return this.prisma.concertFormat.findUnique({ where: { slug } });
  }

  findByName(name: string): Promise<ConcertFormatModel | null> {
    return this.prisma.concertFormat.findUnique({ where: { name } });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  create(data: CreateConcertFormatData): Promise<ConcertFormatModel> {
    return this.prisma.concertFormat.create({ data });
  }

  update(
    id: string,
    data: UpdateConcertFormatData,
  ): Promise<ConcertFormatModel> {
    return this.prisma.concertFormat.update({ where: { id }, data });
  }

  delete(id: string): Promise<ConcertFormatModel> {
    return this.prisma.concertFormat.delete({ where: { id } });
  }
}
