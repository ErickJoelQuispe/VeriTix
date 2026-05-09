import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import UiEventCard from '@/components/ui/EventCard.vue'

const event = {
  id: 'evt-100',
  name: 'Neon Skyline Live',
  dateISO: '2026-05-24T20:30:00.000Z',
  imageUrl: 'https://cdn.example/neon-skyline.jpg',
  currency: 'USD',
  venue: {
    id: 'ven-1',
    name: 'Luna Arena',
    city: 'Buenos Aires',
  },
  format: {
    id: 'fmt-1',
    name: 'Presencial',
  },
}

describe('ui event card', () => {
  it('keeps the media full-bleed and the content padded inside the panel', async () => {
    const wrapper = await mountSuspended(UiEventCard, {
      props: {
        event,
      },
    })

    const root = wrapper.get('article')
    expect(root.classes()).not.toContain('p-4')
    expect(root.classes()).not.toContain('sm:p-5')

    const children = Array.from(root.element.children)
    expect((children[0] as HTMLElement).getAttribute('data-test')).toBe('event-card-media')
    expect((children[1] as HTMLElement).getAttribute('data-test')).toBe('event-card-content')

    const media = wrapper.get('[data-test="event-card-media"]')
    expect(media.classes()).toContain('w-full')
    expect(media.classes()).toContain('overflow-hidden')

    const content = wrapper.get('[data-test="event-card-content"]')
    expect(content.classes()).toContain('px-4')
    expect(content.classes()).toContain('sm:px-5')
    expect(content.classes()).toContain('py-4')
    expect(content.classes()).toContain('sm:py-5')

    const footer = wrapper.get('[data-test="event-card-footer"]')
    expect(footer.classes()).toContain('border-t')
    expect(footer.classes()).toContain('mt-auto')

    expect(wrapper.text()).toContain('24 may')
    expect(wrapper.text()).not.toContain('Luna Arena')
    expect(wrapper.text()).not.toContain('Price ·')
    expect(wrapper.text()).not.toContain('20:30')

    expect(wrapper.get('a').classes()).toContain('w-full')
  })
})
