import type { Ref } from 'vue'

interface UnsavedChangesGuardOptions {
  isDirty: Ref<boolean>
  isSubmitting?: Ref<boolean>
  message?: string
}

const DEFAULT_UNSAVED_CHANGES_MESSAGE = 'Tenés cambios sin guardar. ¿Querés salir igual?'

export function useUnsavedChangesGuard(options: UnsavedChangesGuardOptions) {
  const confirmationMessage = options.message ?? DEFAULT_UNSAVED_CHANGES_MESSAGE

  function shouldBlockNavigation() {
    return options.isDirty.value && !options.isSubmitting?.value
  }

  function confirmLeave() {
    if (!shouldBlockNavigation()) {
      return true
    }

    // eslint-disable-next-line no-alert
    return window.confirm(confirmationMessage)
  }

  onBeforeRouteLeave(() => {
    if (!import.meta.client) {
      return true
    }

    return confirmLeave()
  })

  if (import.meta.client) {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockNavigation()) {
        return
      }

      event.preventDefault()
      event.returnValue = ''
    }

    onMounted(() => {
      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })
  }
}
