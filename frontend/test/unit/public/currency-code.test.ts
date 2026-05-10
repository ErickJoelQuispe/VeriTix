import { describe, expect, it } from 'vitest'

import { normalizeCurrencyCode } from '@/repositories/publicEventsRepository'

describe('normalizeCurrencyCode', () => {
  it('preserva monedas soportadas y cae a EUR en inválidas', () => {
    expect(normalizeCurrencyCode('EUR')).toBe('EUR')
    expect(normalizeCurrencyCode('USD')).toBe('USD')
    expect(normalizeCurrencyCode('COP')).toBe('COP')
    expect(normalizeCurrencyCode('ARS')).toBe('EUR')
    expect(normalizeCurrencyCode('')).toBe('EUR')
  })
})
