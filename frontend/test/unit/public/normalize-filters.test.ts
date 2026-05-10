import { describe, expect, it } from 'vitest'

import { normalizeFilters } from '@/composables/public/usePublicEvents'

describe('normalizeFilters', () => {
  it('devuelve defaults estables cuando no recibe nada', () => {
    expect(normalizeFilters()).toEqual({
      dateFrom: '',
      dateTo: '',
      search: '',
      artistName: '',
      venueName: '',
      genreId: '',
      city: '',
      page: 1,
    })
  })

  it('trimea strings y normaliza páginas inválidas', () => {
    expect(normalizeFilters({
      dateFrom: ' 2026-05-01 ',
      search: '  rock  ',
      genreId: ' genre-1 ',
      artistName: '  artista  ',
      venueName: '  venue  ',
      page: 0,
    })).toEqual({
      dateFrom: '2026-05-01',
      dateTo: '',
      search: 'rock',
      artistName: 'artista',
      venueName: 'venue',
      genreId: 'genre-1',
      city: '',
      page: 1,
    })
  })
})
