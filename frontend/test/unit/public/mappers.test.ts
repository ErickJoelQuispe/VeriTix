import type { PublicEventDetailApiItem, PublicEventListApiItem } from '~~/shared/api/public-events'

import { describe, expect, it } from 'vitest'

import {
  buildEventFallbackImage,
  mapEventDetail,
  mapEventListItem,
} from '@/repositories/publicEventsRepository'

describe('mapEventListItem', () => {
  const input: PublicEventListApiItem = {
    id: 'evt-100',
    name: 'Festival Test',
    eventDate: '2026-07-18T19:30:00.000Z',
    imageUrl: null,
    status: 'PUBLISHED',
    currency: 'EUR',
    venue: { id: 'v-1', name: 'Venue', city: 'City' },
    format: null,
  }

  it('mapea el item y genera fallback de imagen/currency', () => {
    const result = mapEventListItem(input)

    expect(result.id).toBe('evt-100')
    expect(result.imageUrl).toContain('picsum.photos/seed/veritix-event-evt-100')
    expect(result.currency).toBe('EUR')
    expect(result.venue.city).toBe('City')
  })
})

describe('mapEventDetail', () => {
  const input: PublicEventDetailApiItem = {
    id: 'evt-200',
    name: 'Festival Detail',
    description: 'Descripción larga',
    eventDate: '2026-08-01T21:00:00.000Z',
    doorsOpenTime: null,
    startSale: null,
    endSale: null,
    maxCapacity: 5000,
    imageUrl: null,
    status: 'PUBLISHED',
    currency: 'ARS',
    creatorId: 'user-2',
    venue: {
      id: 'v-2',
      name: 'Teatro',
      slug: 'teatro',
      address: 'Calle 123',
      city: 'BSAS',
      state: null,
      country: 'AR',
      capacity: 5000,
      type: 'THEATER',
      imageUrl: null,
    },
    format: {
      id: 'f-1',
      name: 'Presencial',
      slug: 'presencial',
      description: null,
      icon: null,
    },
    genres: [
      { id: 'g-1', name: 'Rock', slug: 'rock' },
    ],
  }

  it('mapea detalle preservando campos anidados y fechas ISO', () => {
    const result = mapEventDetail(input)

    expect(result.id).toBe('evt-200')
    expect(result.maxCapacity).toBe(5000)
    expect(result.currency).toBe('ARS')
    expect(result.imageUrl).toContain('picsum.photos/seed/veritix-event-evt-200')
    expect(result.venue.name).toBe('Teatro')
    expect(result.format?.name).toBe('Presencial')
    expect(result.genres).toHaveLength(1)
  })
})

describe('buildEventFallbackImage', () => {
  it('genera URL de fallback con el id del evento', () => {
    expect(buildEventFallbackImage('evt-999'))
      .toBe('https://picsum.photos/seed/veritix-event-evt-999/900/1200')
  })
})
