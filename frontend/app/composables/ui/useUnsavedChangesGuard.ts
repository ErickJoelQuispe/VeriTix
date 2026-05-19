import type { Ref } from 'vue'

interface UnsavedChangesGuardOptions {
  isDirty: Ref<boolean>
  isSubmitting?: Ref<boolean>
  message?: string
}

const DEFAULT_UNSAVED_CHANGES_MESSAGE = 'Tenés cambios sin guardar. Si salís ahora, se perderán.'

export function useUnsavedChangesGuard(options: UnsavedChangesGuardOptions) {
  const { confirm } = useConfirmDialog()
  const confirmationMessage = options.message ?? DEFAULT_UNSAVED_CHANGES_MESSAGE

  function shouldBlockNavigation() {
    return options.isDirty.value && !options.isSubmitting?.value
  }

  onBeforeRouteLeave(async () => {
    if (!import.meta.client) {
      return true
    }

    if (!shouldBlockNavigation()) {
      return true
    }

    return confirm({ message: confirmationMessage })
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
