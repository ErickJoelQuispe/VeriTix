interface ToastItem {
  id?: string
  title: string
  description: string
  color?: 'error' | 'success' | 'info' | 'warning' | 'neutral'
  icon?: string
  duration?: number
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

export function useToastQueue() {
  const toasts = useState<Required<ToastItem>[]>('vtx-toasts', () => [])

  function remove(id: string) {
    const timer = timers.get(id)

    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }

    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  function add(toast: ToastItem) {
    const id = toast.id ?? (globalThis.crypto?.randomUUID?.() || `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    const normalized: Required<ToastItem> = {
      id,
      title: toast.title,
      description: toast.description,
      color: toast.color ?? 'neutral',
      icon: toast.icon ?? 'i-lucide-bell',
      duration: toast.duration ?? 4200,
    }

    remove(id)
    toasts.value = [...toasts.value, normalized]

    if (normalized.duration > 0) {
      const timer = setTimeout(() => remove(id), normalized.duration)
      timers.set(id, timer)
    }
  }

  function clear() {
    toasts.value.forEach(toast => remove(toast.id))
  }

  return {
    toasts,
    add,
    remove,
    clear,
  }
}
