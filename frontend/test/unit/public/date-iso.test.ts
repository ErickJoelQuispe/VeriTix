import { describe, expect, it } from 'vitest'

import { toIsoString } from '@/repositories/publicEventsRepository'

describe('toIsoString', () => {
  it('convierte Date y deja pasar strings; nullish devuelve null', () => {
    const date = new Date('2026-05-24T20:30:00.000Z')
    expect(toIsoString(date)).toBe('2026-05-24T20:30:00.000Z')
    expect(toIsoString('2026-05-24T20:30:00.000Z')).toBe('2026-05-24T20:30:00.000Z')
    expect(toIsoString(null)).toBeNull()
    expect(toIsoString(undefined)).toBeNull()
  })
})
