import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import EventsPriceChip from '~/components/events/PriceChip.vue'

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

describe('events price chip', () => {
  it('renderiza el prefijo y el monto formateado', async () => {
    const wrapper = await mountSuspended(EventsPriceChip, {
      props: {
        money: {
          amount: 25,
          currency: 'EUR',
        },
      },
    })

    expect(normalizeText(wrapper.text())).toBe('Desde 25 €')
  })
})
