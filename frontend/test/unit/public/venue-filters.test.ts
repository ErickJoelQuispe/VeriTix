import { describe, expect, it } from 'vitest'

import { normalizeVenueFilters } from '@/composables/public/usePublicVenues'

describe('normalizeVenueFilters', () => {
  it('normaliza filtros de venues', () => {
    expect(normalizeVenueFilters({
      search: '  foro sol  ',
      city: '  CDMX ',
      type: ' FORO ',
      isActive: ' false ',
      page: 2,
    })).toEqual({
      search: 'foro sol',
      city: 'CDMX',
      type: 'FORO',
      isActive: 'false',
      page: 2,
    })
  })
})
