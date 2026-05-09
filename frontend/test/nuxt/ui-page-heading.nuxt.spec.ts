import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import UiPageHeading from '@/components/ui/PageHeading.vue'

describe('ui page heading', () => {
  it('renders a premium hero surface with optional action', async () => {
    const wrapper = await mountSuspended(UiPageHeading, {
      props: {
        eyebrow: 'Cartelera',
        title: 'Curated Transmissions.',
        description: 'Explorá el catálogo curado de eventos.',
        actionLabel: 'Ver eventos',
        actionTo: '/events',
      },
    })

    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.get('[data-test="page-heading-eyebrow"]').text()).toBe('Cartelera')
    expect(wrapper.get('h1').text()).toBe('Curated Transmissions.')
    expect(wrapper.get('[data-test="page-heading-description"]').text()).toContain('Explorá el catálogo curado')
    expect(wrapper.get('a').text()).toBe('Ver eventos')
    expect(wrapper.classes()).toContain('border-b')
    expect(wrapper.classes()).toContain('border-white/16')
    expect(wrapper.classes()).not.toContain('bg-elevated/45')
    expect(wrapper.classes()).not.toContain('backdrop-blur-md')
  })

  it('centers the content when requested', async () => {
    const wrapper = await mountSuspended(UiPageHeading, {
      props: {
        title: 'Centered Title',
        center: true,
      },
    })

    expect(wrapper.get('[data-test="page-heading-content"]').classes()).toContain('text-center')
    expect(wrapper.get('[data-test="page-heading-title-group"]').classes()).toContain('mx-auto')
  })
})
