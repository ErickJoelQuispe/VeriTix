import { describe, expect, it } from 'vitest'

import { formatMoney } from '../../app/utils/currency-formatters'

describe('formatMoney', () => {
  it('formatea COP sin decimales para el locale por defecto', () => {
    expect(formatMoney(120000, 'COP')).toBe('120.000\u00A0COP')
  })

  it('permite formatear otra moneda con locale explicito', () => {
    expect(formatMoney(25, 'EUR', 'es-ES')).toBe('25\u00A0€')
  })
})
