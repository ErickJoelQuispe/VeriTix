import type { CurrencyCode } from '~/types'

export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  locale = 'es-ES',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
