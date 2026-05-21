import { describe, expect, it } from 'vitest'

import {
  hasArtistSemanticChanges,
  hasConcertFormatSemanticChanges,
  hasEventSemanticChanges,
  hasGenreSemanticChanges,
  hasUserSemanticChanges,
  normalizeArtistPayload,
  normalizeConcertFormatPayload,
  normalizeGenrePayload,
  normalizeCreateUserPayload,
  normalizeEventPayload,
  normalizeUpdateUserPayload,
} from '@/utils/backoffice/formSafeRails'

describe('backoffice formSafeRails', () => {
  it('normaliza y compara eventos semánticamente', () => {
    const payload = normalizeEventPayload({
      name: '  Rock Fest  ',
      description: '  ',
      eventDate: '2026-08-15T20:00:00.000Z',
      doorsOpenTime: '2026-08-15T18:00:00.000Z',
      startSale: '',
      endSale: undefined,
      maxCapacity: '1200' as any,
      venueId: '  venue-1  ',
      imageUrl: '  https://example.com/event.jpg  ',
      currency: 'EUR',
      formatId: 'format-1',
      genreIds: [' genre-1 ', 'genre-2'],
    })

    expect(payload).toEqual({
      name: 'Rock Fest',
      description: undefined,
      eventDate: '2026-08-15T20:00:00.000Z',
      doorsOpenTime: '2026-08-15T18:00:00.000Z',
      startSale: undefined,
      endSale: undefined,
      maxCapacity: 1200,
      venueId: 'venue-1',
      imageUrl: 'https://example.com/event.jpg',
      currency: 'EUR',
      formatId: 'format-1',
      genreIds: ['genre-1', 'genre-2'],
    })

    expect(hasEventSemanticChanges(
      {
        name: 'Rock Fest',
        description: null,
        eventDate: '2026-08-15T20:00:00.000Z',
        doorsOpenTime: '2026-08-15T18:00:00.000Z',
        startSale: null,
        endSale: null,
        maxCapacity: 1200,
        venue: { id: 'venue-1' },
        imageUrl: 'https://example.com/event.jpg',
        currency: 'EUR',
        format: { id: 'format-1' },
        genres: [{ id: 'genre-1' }, { id: 'genre-2' }],
      } as any,
      payload,
    )).toBe(false)

    expect(hasEventSemanticChanges(
      {
        name: 'Rock Fest',
        description: null,
        eventDate: '2026-08-15T20:00:00.000Z',
        doorsOpenTime: '2026-08-15T18:00:00.000Z',
        startSale: null,
        endSale: null,
        maxCapacity: 1200,
        venue: { id: 'venue-1' },
        imageUrl: 'https://example.com/event.jpg',
        currency: 'EUR',
        format: { id: 'format-1' },
        genres: [{ id: 'genre-1' }, { id: 'genre-2' }],
      } as any,
      { ...payload, maxCapacity: 1300 },
    )).toBe(true)
  })

  it('normaliza y compara artistas semánticamente', () => {
    const payload = normalizeArtistPayload({
      name: '  Ana  ',
      slug: '  ana-lopez  ',
      bio: '  ',
      imageUrl: ' https://example.com/artist.jpg ',
      country: '  ES  ',
      website: undefined,
      isActive: true,
      genreIds: [' genre-1 ', 'genre-2'],
    })

    expect(payload).toEqual({
      name: 'Ana',
      slug: 'ana-lopez',
      bio: undefined,
      imageUrl: 'https://example.com/artist.jpg',
      country: 'ES',
      website: undefined,
      isActive: true,
      genreIds: ['genre-1', 'genre-2'],
    })

    expect(hasArtistSemanticChanges(
      {
        name: 'Ana',
        slug: 'ana-lopez',
        bio: null,
        imageUrl: 'https://example.com/artist.jpg',
        country: 'ES',
        website: null,
        isActive: true,
        genres: [{ id: 'genre-1' }, { id: 'genre-2' }],
      } as any,
      payload,
    )).toBe(false)

    expect(hasArtistSemanticChanges(
      {
        name: 'Ana',
        slug: 'ana-lopez',
        bio: null,
        imageUrl: 'https://example.com/artist.jpg',
        country: 'ES',
        website: null,
        isActive: true,
        genres: [{ id: 'genre-1' }, { id: 'genre-2' }],
      } as any,
      { ...payload, country: 'AR' },
    )).toBe(true)
  })

  it('normaliza y compara géneros y formatos semánticamente', () => {
    const genrePayload = normalizeGenrePayload({
      name: '  Rock  ',
      slug: '  rock-alt  ',
      description: '  Género con guitarras  ',
    })

    expect(genrePayload).toEqual({
      name: 'Rock',
      slug: 'rock-alt',
      description: 'Género con guitarras',
    })

    expect(hasGenreSemanticChanges(
      {
        id: 'genre-1',
        name: 'Rock',
        slug: 'rock-alt',
        description: 'Género con guitarras',
      } as any,
      genrePayload,
    )).toBe(false)

    expect(hasGenreSemanticChanges(
      {
        id: 'genre-1',
        name: 'Rock',
        slug: 'rock-alt',
        description: 'Género con guitarras',
      } as any,
      { ...genrePayload, slug: 'rock' },
    )).toBe(true)

    const formatPayload = normalizeConcertFormatPayload({
      name: '  Concierto  ',
      slug: '  concierto-en-vivo  ',
      description: '  Evento musical  ',
      icon: '  i-lucide-ticket  ',
    })

    expect(formatPayload).toEqual({
      name: 'Concierto',
      slug: 'concierto-en-vivo',
      description: 'Evento musical',
      icon: 'i-lucide-ticket',
    })

    expect(hasConcertFormatSemanticChanges(
      {
        id: 'format-1',
        name: 'Concierto',
        slug: 'concierto-en-vivo',
        description: 'Evento musical',
        icon: 'i-lucide-ticket',
      } as any,
      formatPayload,
    )).toBe(false)

    expect(hasConcertFormatSemanticChanges(
      {
        id: 'format-1',
        name: 'Concierto',
        slug: 'concierto-en-vivo',
        description: 'Evento musical',
        icon: 'i-lucide-ticket',
      } as any,
      { ...formatPayload, icon: 'i-lucide-music-2' },
    )).toBe(true)
  })

  it('normaliza y compara usuarios semánticamente', () => {
    const createPayload = normalizeCreateUserPayload({
      email: '  user@example.com  ',
      phone: '  +34958123456  ',
      name: '  User  ',
      lastName: '  One  ',
      password: 'Secret123',
      role: 'BUYER',
    })

    expect(createPayload).toEqual({
      email: 'user@example.com',
      phone: '+34958123456',
      name: 'User',
      lastName: 'One',
      password: 'Secret123',
      role: 'BUYER',
    })

    const updatePayload = normalizeUpdateUserPayload({
      email: '  user@example.com  ',
      phone: '  +34958123456  ',
      name: '  User  ',
      lastName: '  One  ',
      avatarUrl: ' https://example.com/avatar.jpg ',
      role: 'BUYER',
      isActive: true,
      emailVerified: false,
    })

    expect(updatePayload).toEqual({
      email: 'user@example.com',
      phone: '+34958123456',
      name: 'User',
      lastName: 'One',
      avatarUrl: 'https://example.com/avatar.jpg',
      role: 'BUYER',
      isActive: true,
      emailVerified: false,
    })

    expect(hasUserSemanticChanges(
      {
        email: 'user@example.com',
        phone: '+34958123456',
        name: 'User',
        lastName: 'One',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'BUYER',
        isActive: true,
        emailVerified: false,
      } as any,
      updatePayload,
    )).toBe(false)

    expect(hasUserSemanticChanges(
      {
        email: 'user@example.com',
        phone: '+34958123456',
        name: 'User',
        lastName: 'One',
        avatarUrl: 'https://example.com/avatar.jpg',
        role: 'BUYER',
        isActive: true,
        emailVerified: false,
      } as any,
      { ...updatePayload, emailVerified: true },
    )).toBe(true)
  })
})
