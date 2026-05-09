import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import UiPanel from '@/components/ui/Panel.vue'

describe('ui panel', () => {
  it('renders the default solid surface with shared sizing', async () => {
    const wrapper = await mountSuspended(UiPanel, {
      props: {
        padding: 'lg',
        radius: 'xl',
      },
      slots: {
        default: '<span data-test="content">Contenido</span>',
      },
    })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('rounded-3xl')
    expect(wrapper.classes()).toContain('p-5')
    expect(wrapper.classes()).toContain('sm:p-6')
    expect(wrapper.classes()).toContain('bg-elevated/72')
    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
  })

  it('renders as a glass form with blur and transparency', async () => {
    const wrapper = await mountSuspended(UiPanel, {
      props: {
        as: 'form',
        variant: 'glass',
        interactive: true,
      },
    })

    expect(wrapper.element.tagName).toBe('FORM')
    expect(wrapper.classes()).toContain('bg-elevated/45')
    expect(wrapper.classes()).toContain('backdrop-blur-md')
    expect(wrapper.classes()).toContain('hover:border-default/60')
  })
})
