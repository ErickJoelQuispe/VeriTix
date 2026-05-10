import { describe, expect, it } from 'vitest'

import {
  buildEventFallbackImage,
  mapEventDetail,
  mapEventListItem,
} from '@/repositories/publicEventsRepository'

describe('mapEventListItem', () => {
  it('mapea el item y genera fallback de imagen/currency', () => {
    const result = mapEventListItem({
      id: 'evt-100',
      name: 'Festival Test',
      description: null,
      eventDate: '2026-07-18T19:30:00.000Z',
      doorsOpenTime: null,
      startSale: null,
      endSale: null,
      maxCapacity: null,
      imageUrl: null,
      currency: 'EUR',
      creatorId: 'user-1',
      venue: { id: 'v-1', name: 'Venue', city: 'City' },
      format: null,
      genres: [],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    expect(result.id).toBe('evt-100')
    expect(result.imageUrl).toContain('picsum.photos/seed/veritix-event-evt-100')
    expect(result.currency).toBe('EUR')
    expect(result.venue.city).toBe('City')
  })
})

describe('mapEventDetail', () => {
  it('mapea detalle preservando campos anidados y fechas ISO', () => {
    const result = mapEventDetail({
      id: 'evt-200',
      name: 'Festival Detail',
      description: 'Descripción larga',
      eventDate: '2026-08-01T21:00:00.000Z',
      doorsOpenTime: null,
      startSale: null,
      endSale: null,
      maxCapacity: 5000,
      imageUrl: null,
      currency: 'ARS',
      creatorId: 'user-2',
      venue: { id: 'v-2', name: 'Teatro', city: 'BSAS' },
      format: { id: 'f-1', name: 'Presencial', slug: 'presencial', description: null, icon: null },
      genres: [{ id: 'g-1', name: 'Rock', slug: 'rock' }],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    expect(result.id).toBe('evt-200')
    expect(result.maxCapacity).toBe(5000)
    expect(result.currency).toBe('EUR') // ARS cae a EUR
    expect(result.imageUrl).toContain('picsum.photos/seed/veritix-event-evt-200')
    expect(result.venue.name).toBe('Teatro')
    expect(result.format?.name).toBe('Presencial')
    expect(result.genres).toHaveLength(1)
  })
})

describe('buildEventFallbackImage', () => {
  it('genera URL de fallback con el id del evento', () => {
    expect(buildEventFallbackImage('evt-999')).toBe('https://picsum.photos/seed/veritix-event-evt-999/900/1200')
  })
})
