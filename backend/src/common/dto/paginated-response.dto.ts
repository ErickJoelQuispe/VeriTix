import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Total de registros en la base de datos.' })
  total: number;

  @ApiProperty({ description: 'Número de página actual.' })
  page: number;

  @ApiProperty({ description: 'Cantidad de registros por página.' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas disponibles.' })
  totalPages: number;

  @ApiProperty({ description: 'Indica si hay una página siguiente.' })
  hasNext: boolean;

  @ApiProperty({ description: 'Indica si hay una página anterior.' })
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
