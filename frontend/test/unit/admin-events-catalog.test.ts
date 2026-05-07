import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildCatalogQuery,
  buildCatalogSummary,
  createCatalogListItems,
  getEventStatusColor,
} from '../../app/utils/admin/eventsCatalog'

describe('buildCatalogQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('trimea filtros y aplica ventana upcoming cuando no hay fechas manuales', () => {
    expect(buildCatalogQuery({
      pageValue: 2,
      pageSize: 24,
      quickWindow: 'upcoming',
      filters: {
        search: '  prog metal  ',
        city: '  Bogotá  ',
        genreId: '',
        formatId: 'fmt-1',
        dateFrom: '',
        dateTo: '',
      },
    })).toEqual({
      page: 2,
      limit: 24,
      search: 'prog metal',
      city: 'Bogotá',
      genreId: undefined,
      formatId: 'fmt-1',
      dateFrom: '2026-04-20T12:00:00.000Z',
      dateTo: undefined,
    })
  })

  it('prioriza fechas manuales sobre la quick window', () => {
    expect(buildCatalogQuery({
      pageValue: 1,
      pageSize: 12,
      quickWindow: 'past',
      filters: {
        search: '',
        city: '',
        genreId: 'genre-1',
        formatId: '',
        dateFrom: '2026-05-10',
        dateTo: '2026-05-12',
      },
    })).toEqual({
      page: 1,
      limit: 12,
      search: undefined,
      city: undefined,
      genreId: 'genre-1',
      formatId: undefined,
      dateFrom: new Date('2026-05-10T00:00:00').toISOString(),
      dateTo: new Date('2026-05-12T23:59:59').toISOString(),
    })
  })

  it('calcula el rango completo de thisMonth', () => {
    const query = buildCatalogQuery({
      pageValue: 3,
      pageSize: 48,
      quickWindow: 'thisMonth',
      filters: {
        search: '',
        city: '',
        genreId: '',
        formatId: '',
        dateFrom: '',
        dateTo: '',
      },
    })

    expect(query.dateFrom).toBe(new Date(2026, 3, 1).toISOString())
    expect(query.dateTo).toBe(new Date(2026, 4, 0, 23, 59, 59).toISOString())
  })
})

describe('createCatalogListItems', () => {
  const catalogEvents = [
    {
      id: 'evt-1',
      name: 'Opeth en Bogotá',
      eventDate: '2026-06-01T20:00:00.000Z',
      status: 'PUBLISHED',
      imageUrl: 'https://cdn.example/opeth.jpg',
      currency: 'COP',
      venue: {
        id: 'venue-1',
        name: 'Movistar Arena',
        city: 'Bogotá',
      },
      format: {
        id: 'fmt-1',
        name: 'Presencial',
      },
    },
  ] as const

  it('mapea eventos publicados al view model', () => {
    expect(createCatalogListItems({
      catalogMode: 'published',
      catalogEvents: [...catalogEvents],
      requiresAttention: [],
    })).toEqual([
      {
        id: 'evt-1',
        title: 'Opeth en Bogotá',
        to: '/admin/events/evt-1/edit',
        eventDate: '2026-06-01T20:00:00.000Z',
        status: 'PUBLISHED',
        imageUrl: 'https://cdn.example/opeth.jpg',
        venueName: 'Movistar Arena',
        venueCity: 'Bogotá',
        formatName: 'Presencial',
        issues: [],
        isReview: false,
      },
    ])
  })

  it('mezcla requiresAttention con catalogEvents en modo review y usa fallbacks', () => {
    expect(createCatalogListItems({
      catalogMode: 'review',
      catalogEvents: [...catalogEvents],
      requiresAttention: [
        {
          id: 'evt-1',
          name: 'Opeth en Bogotá',
          status: 'DRAFT',
          eventDate: '2026-06-01T20:00:00.000Z',
          issues: ['Sin poster'],
        },
        {
          id: 'evt-2',
          name: 'Soen en Medellín',
          status: 'DRAFT',
          eventDate: null,
          issues: ['Sin venue'],
        },
      ],
    })).toEqual([
      {
        id: 'evt-1',
        title: 'Opeth en Bogotá',
        to: '/admin/events/evt-1/edit',
        eventDate: '2026-06-01T20:00:00.000Z',
        status: 'DRAFT',
        imageUrl: 'https://cdn.example/opeth.jpg',
        venueName: 'Movistar Arena',
        venueCity: 'Bogotá',
        formatName: 'Presencial',
        issues: ['Sin poster'],
        isReview: true,
      },
      {
        id: 'evt-2',
        title: 'Soen en Medellín',
        to: '/admin/events/evt-2/edit',
        eventDate: null,
        status: 'DRAFT',
        imageUrl: null,
        venueName: '',
        venueCity: '',
        formatName: '',
        issues: ['Sin venue'],
        isReview: true,
      },
    ])
  })
})

describe('buildCatalogSummary', () => {
  it('resume el estado review sin pendientes', () => {
    expect(buildCatalogSummary({
      catalogMode: 'review',
      requiresAttentionCount: 0,
      meta: { total: 0, page: 1, limit: 24, totalPages: 0 },
    })).toBe('No hay eventos pendientes de revisión.')
  })

  it('resume el rango visible en published', () => {
    expect(buildCatalogSummary({
      catalogMode: 'published',
      requiresAttentionCount: 3,
      meta: { total: 52, page: 2, limit: 24, totalPages: 3 },
    })).toBe('Mostrando 25-48 de 52 eventos publicados.')
  })
})

describe('getEventStatusColor', () => {
  it.each([
    ['PUBLISHED', 'success'],
    ['DRAFT', 'warning'],
    ['CANCELLED', 'error'],
    ['ARCHIVED', 'neutral'],
  ])('mapea %s a %s', (status, expected) => {
    expect(getEventStatusColor(status)).toBe(expected)
  })
})
