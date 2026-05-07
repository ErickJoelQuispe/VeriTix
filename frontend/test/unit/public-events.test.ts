import { describe, expect, it } from 'vitest'

import {
  buildEventFallbackImage,
  mapEventDetail,
  mapEventListItem,
  normalizeCurrencyCode,
  normalizeFilters,
  toIsoString,
} from '../../app/composables/usePublicEvents'

describe('normalizeFilters', () => {
  it('devuelve defaults estables cuando no recibe nada', () => {
    expect(normalizeFilters()).toEqual({
      search: '',
      genreId: '',
      city: '',
      page: 1,
    })
  })

  it('trimea strings y normaliza páginas inválidas', () => {
    expect(normalizeFilters({
      search: '  porcupine tree  ',
      genreId: ' genre-1 ',
      city: '  Medellín ',
      page: 0,
    })).toEqual({
      search: 'porcupine tree',
      genreId: 'genre-1',
      city: 'Medellín',
      page: 1,
    })
  })
})

describe('normalizeCurrencyCode', () => {
  it('preserva monedas soportadas y cae a EUR en inválidas', () => {
    expect(normalizeCurrencyCode('COP')).toBe('COP')
    expect(normalizeCurrencyCode('ARS')).toBe('EUR')
  })
})

describe('toIsoString', () => {
  it('convierte Date y deja pasar strings; nullish devuelve null', () => {
    expect(toIsoString(new Date('2026-07-10T12:30:00.000Z'))).toBe('2026-07-10T12:30:00.000Z')
    expect(toIsoString('2026-07-10T12:30:00.000Z')).toBe('2026-07-10T12:30:00.000Z')
    expect(toIsoString(null)).toBeNull()
  })
})

describe('mapEventListItem', () => {
  it('mapea el item y genera fallback de imagen/currency', () => {
    expect(mapEventListItem({
      id: 'evt-100',
      name: 'Leprous',
      eventDate: new Date('2026-08-01T20:00:00.000Z'),
      imageUrl: null,
      currency: 'ARS',
      venue: {
        id: 'venue-9',
        name: 'Royal Center',
        city: 'Bogotá',
      },
      format: null,
    })).toEqual({
      id: 'evt-100',
      name: 'Leprous',
      dateISO: '2026-08-01T20:00:00.000Z',
      imageUrl: buildEventFallbackImage('evt-100'),
      currency: 'EUR',
      venue: {
        id: 'venue-9',
        name: 'Royal Center',
        city: 'Bogotá',
      },
      format: null,
    })
  })
})

describe('mapEventDetail', () => {
  it('mapea detalle preservando campos anidados y fechas ISO', () => {
    expect(mapEventDetail({
      id: 'evt-200',
      name: 'Haken',
      description: 'Tour aniversario',
      eventDate: '2026-09-01T20:00:00.000Z',
      doorsOpenTime: new Date('2026-09-01T18:00:00.000Z'),
      startSale: null,
      endSale: new Date('2026-08-25T23:59:59.000Z'),
      maxCapacity: 3000,
      imageUrl: null,
      currency: 'USD',
      creatorId: 'user-1',
      venue: {
        id: 'venue-1',
        name: 'Arena',
        slug: 'arena',
        address: 'Calle 123',
        city: 'Bogotá',
        state: null,
        country: 'CO',
        capacity: 5000,
        type: 'indoor',
        imageUrl: null,
      },
      format: {
        id: 'fmt-1',
        name: 'Presencial',
        slug: 'presencial',
        description: null,
        icon: null,
      },
      genres: [
        {
          id: 'genre-1',
          name: 'Progressive Metal',
          slug: 'progressive-metal',
        },
      ],
    })).toEqual({
      id: 'evt-200',
      name: 'Haken',
      description: 'Tour aniversario',
      dateISO: '2026-09-01T20:00:00.000Z',
      doorsOpenISO: '2026-09-01T18:00:00.000Z',
      startSaleISO: null,
      endSaleISO: '2026-08-25T23:59:59.000Z',
      maxCapacity: 3000,
      imageUrl: buildEventFallbackImage('evt-200'),
      currency: 'USD',
      creatorId: 'user-1',
      venue: {
        id: 'venue-1',
        name: 'Arena',
        slug: 'arena',
        address: 'Calle 123',
        city: 'Bogotá',
        state: null,
        country: 'CO',
        capacity: 5000,
        type: 'indoor',
        imageUrl: null,
      },
      format: {
        id: 'fmt-1',
        name: 'Presencial',
        slug: 'presencial',
        description: null,
        icon: null,
      },
      genres: [
        {
          id: 'genre-1',
          name: 'Progressive Metal',
          slug: 'progressive-metal',
        },
      ],
    })
  })
})
