import { describe, expect, it } from 'vitest'

import { normalizeArtistFilters } from '@/composables/public/usePublicArtists'
import { normalizeVenueFilters } from '@/composables/public/usePublicVenues'

describe('normalizeArtistFilters', () => {
  it('normaliza strings y página por defecto', () => {
    expect(
      normalizeArtistFilters({
        search: '  The Strokes  ',
        genreId: ' genre-1 ',
        country: '  AR ',
        isActive: ' true ',
        page: 0,
      }),
    ).toEqual({
      search: 'The Strokes',
      genreId: 'genre-1',
      country: 'AR',
      isActive: 'true',
      page: 1,
    })
  })
})

describe('normalizeVenueFilters', () => {
  it('normaliza filtros de venues', () => {
    expect(
      normalizeVenueFilters({
        search: '  foro sol  ',
        city: '  CDMX ',
        type: ' FORO ',
        isActive: ' false ',
        page: 2,
      }),
    ).toEqual({
      search: 'foro sol',
      city: 'CDMX',
      type: 'FORO',
      isActive: 'false',
      page: 2,
    })
  })
})
