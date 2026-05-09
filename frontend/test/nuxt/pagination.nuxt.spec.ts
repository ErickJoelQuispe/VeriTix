import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import BasePagination from '@/components/base/Pagination.vue'

describe('base pagination', () => {
  it('renders square pagination buttons with larger icon controls', async () => {
    const wrapper = await mountSuspended(BasePagination, {
      props: {
        page: 5,
        total: 120,
        itemsPerPage: 10,
        showEdges: true,
        size: 'md',
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)

    for (const button of buttons) {
      expect(button.classes()).toContain('h-10')
      expect(button.classes()).toContain('w-10')
      expect(button.classes()).toContain('rounded-lg')
    }

    const edgeIcon = buttons[0].find('svg')
    expect(edgeIcon.exists()).toBe(true)
    expect(edgeIcon.classes()).toContain('size-5')

    expect(wrapper.text()).toContain('5')
    expect(wrapper.classes()).toContain('flex')
  })
})
