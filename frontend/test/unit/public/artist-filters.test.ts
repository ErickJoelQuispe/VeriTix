import { describe, expect, it } from 'vitest'

import { normalizeArtistFilters } from '@/composables/public/usePublicArtists'

describe('normalizeArtistFilters', () => {
  it('normaliza strings y página por defecto', () => {
    expect(normalizeArtistFilters({
      search: '  The Strokes  ',
      genreId: ' genre-1 ',
      country: '  AR ',
      isActive: ' true ',
      page: 0,
    })).toEqual({
      search: 'The Strokes',
      genreId: 'genre-1',
      country: 'AR',
      isActive: 'true',
      page: 1,
    })
  })
})
