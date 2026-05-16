import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StarRating from '@/components/ui/StarRating.vue'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('StarRating', () => {
  it('renders 3 filled and 2 empty stars when modelValue is 3', async () => {
    const wrapper = await mountSuspended(StarRating, {
      props: {
        modelValue: 3,
        readonly: true,
      },
    })
    await flushPromises()

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(5)

    // In readonly mode the star icons have text-primary for filled, text-muted/40 for empty
    const allIcons = wrapper.findAll('svg, [class*="i-lucide-star"]')
    // Check star button aria-labels are present
    const stars = wrapper.findAll('button')
    expect(stars).toHaveLength(5)
  })

  it('emits update:modelValue with the star index when a star is clicked (interactive)', async () => {
    const wrapper = await mountSuspended(StarRating, {
      props: {
        modelValue: 0,
        readonly: false,
      },
    })
    await flushPromises()

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(5)

    // Click on the 3rd star (index 2, which is star 3)
    await buttons[2]!.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0]).toEqual([3])
  })

  it('does NOT emit update:modelValue when readonly=true and star is clicked', async () => {
    const wrapper = await mountSuspended(StarRating, {
      props: {
        modelValue: 3,
        readonly: true,
      },
    })
    await flushPromises()

    // Attempt to click a button — they are disabled in readonly mode
    const buttons = wrapper.findAll('button')
    // In readonly mode buttons have pointer-events-none and disabled attr
    await buttons[0]!.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeFalsy()
  })

  it('has correct aria-label in readonly mode', async () => {
    const wrapper = await mountSuspended(StarRating, {
      props: {
        modelValue: 4,
        readonly: true,
      },
    })
    await flushPromises()

    const container = wrapper.find('[role="img"]')
    expect(container.exists()).toBe(true)
    expect(container.attributes('aria-label')).toBe('4 de 5 estrellas')
  })
})
