interface NotifyOptions {
  id?: string
  title?: string
  duration?: number
}

interface ToastConfig {
  title: string
  color: 'error' | 'success' | 'info' | 'warning'
  icon: string
}

function pushToast(toast: ReturnType<typeof useToastQueue>, description: string, options: NotifyOptions, config: ToastConfig) {
  toast.add({
    id: options.id,
    title: options.title ?? config.title,
    description,
    color: config.color,
    icon: config.icon,
    duration: options.duration,
  })
}

export function useAppNotifications() {
  const toast = useToastQueue()
  const { getApiErrorMessage, isApiSessionExpiredError } = useApiErrorMessage()
  const { clearAuth } = useAuth()

  function notifyError(description: string, options: NotifyOptions = {}) {
    pushToast(toast, description, options, {
      title: 'Error',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }

  function notifySuccess(description: string, options: NotifyOptions = {}) {
    pushToast(toast, description, options, {
      title: 'Éxito',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }

  function notifyInfo(description: string, options: NotifyOptions = {}) {
    pushToast(toast, description, options, {
      title: 'Aviso',
      color: 'info',
      icon: 'i-lucide-info',
    })
  }

  function notifyApiError(error: unknown, fallback: string, options: NotifyOptions = {}) {
    if (isApiSessionExpiredError(error) && import.meta.client) {
      clearAuth()
      toast.add({
        id: options.id ?? 'auth-session-expired',
        title: 'Sesión expirada',
        description: 'Tu sesión expiró. Volvé a iniciar sesión para continuar.',
        color: 'warning',
        icon: 'i-lucide-log-in',
        duration: options.duration ?? 6000,
      })
      void navigateTo('/login')
      return
    }

    notifyError(getApiErrorMessage(error, fallback), options)
  }

  return {
    notifyError,
    notifySuccess,
    notifyInfo,
    notifyApiError,
  }
}
