import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

const ToastHarness = defineComponent({
  setup() {
    return useToastQueue()
  },
  template: '<div />',
})

let harness: Awaited<ReturnType<typeof mountSuspended>>

beforeEach(async () => {
  vi.useFakeTimers()
  harness = await mountSuspended(ToastHarness)
})

afterEach(() => {
  harness.vm.clear()
  vi.useRealTimers()
})

describe('useToastQueue', () => {
  it('agrega un toast y lo asigna al listado', () => {
    harness.vm.add({ title: 'Éxito', description: 'Todo ok' })

    expect(harness.vm.toasts).toHaveLength(1)
    expect(harness.vm.toasts[0].title).toBe('Éxito')
    expect(harness.vm.toasts[0].description).toBe('Todo ok')
  })

  it('asigna color neutral e icono por defecto', () => {
    harness.vm.add({ title: 'Aviso', description: 'Notificación' })

    expect(harness.vm.toasts[0].color).toBe('neutral')
    expect(harness.vm.toasts[0].icon).toBe('i-lucide-bell')
    expect(harness.vm.toasts[0].duration).toBe(4200)
  })

  it('asigna iconos según el color', () => {
    const icons: Record<string, string> = {
      error: 'i-lucide-circle-alert',
      success: 'i-lucide-circle-check',
      info: 'i-lucide-info',
      warning: 'i-lucide-triangle-alert',
      neutral: 'i-lucide-bell',
    }

    for (const [color, icon] of Object.entries(icons)) {
      harness.vm.add({ title: color, description: '', color: color as any })

      const added = harness.vm.toasts.find((t: any) => t.title === color)
      expect(added.icon).toBe(icon)
    }
  })

  it('genera un id único cuando no se provee', () => {
    harness.vm.add({ title: 'T1', description: '' })
    harness.vm.add({ title: 'T2', description: '' })

    expect(harness.vm.toasts[0].id).toBeTruthy()
    expect(harness.vm.toasts[1].id).toBeTruthy()
    expect(harness.vm.toasts[0].id).not.toBe(harness.vm.toasts[1].id)
  })

  it('usa el id provisto y evita duplicados', () => {
    harness.vm.add({ id: 'dup', title: 'Primero', description: '' })
    harness.vm.add({ id: 'dup', title: 'Segundo', description: '' })

    // El segundo reemplaza al primero
    expect(harness.vm.toasts).toHaveLength(1)
    expect(harness.vm.toasts[0].title).toBe('Segundo')
  })

  it('remueve un toast por id', () => {
    harness.vm.add({ id: 'x', title: 'Test', description: '' })
    expect(harness.vm.toasts).toHaveLength(1)

    harness.vm.remove('x')
    expect(harness.vm.toasts).toHaveLength(0)
  })

  it('limpia todos los toasts', () => {
    harness.vm.add({ title: 'A', description: '' })
    harness.vm.add({ title: 'B', description: '' })
    expect(harness.vm.toasts).toHaveLength(2)

    harness.vm.clear()
    expect(harness.vm.toasts).toHaveLength(0)
  })

  it('auto-descarta después de la duración por defecto', () => {
    harness.vm.add({ id: 'auto', title: 'Auto', description: '', duration: 1000 })
    expect(harness.vm.toasts).toHaveLength(1)

    vi.advanceTimersByTime(999)
    expect(harness.vm.toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(harness.vm.toasts).toHaveLength(0)
  })

  it('respeta duración custom', () => {
    harness.vm.add({ id: 'custom', title: 'Custom', description: '', duration: 500 })
    expect(harness.vm.toasts).toHaveLength(1)

    vi.advanceTimersByTime(500)
    expect(harness.vm.toasts).toHaveLength(0)
  })

  it('no auto-descarta si duration es 0', () => {
    harness.vm.add({ id: 'forever', title: 'Forever', description: '', duration: 0 })

    vi.advanceTimersByTime(99999)
    expect(harness.vm.toasts).toHaveLength(1)
  })

  it('cancela el timer anterior al remover manualmente', () => {
    harness.vm.add({ id: 't', title: 'Timer', description: '', duration: 500 })
    harness.vm.remove('t')

    // Avanzar el tiempo no debería reactivar el toast
    vi.advanceTimersByTime(500)
    expect(harness.vm.toasts).toHaveLength(0)
  })
})
