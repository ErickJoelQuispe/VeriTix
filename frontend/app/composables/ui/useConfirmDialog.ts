interface ConfirmOptions {
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
}

interface DialogState {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
}

let pendingResolve: ((value: boolean) => void) | null = null

export function useConfirmDialog() {
  const dialogState = useState<DialogState>('confirm-dialog', () => ({
    open: false,
    title: 'Cambios sin guardar',
    message: 'Tenés cambios sin guardar. Si salís ahora, se perderán.',
    confirmLabel: 'Salir sin guardar',
    cancelLabel: 'Cancelar',
  }))

  function confirm(options?: ConfirmOptions): Promise<boolean> {
    if (options?.title) {
      dialogState.value.title = options.title
    }

    if (options?.message) {
      dialogState.value.message = options.message
    }

    if (options?.confirmLabel) {
      dialogState.value.confirmLabel = options.confirmLabel
    }

    if (options?.cancelLabel) {
      dialogState.value.cancelLabel = options.cancelLabel
    }

    dialogState.value.open = true

    return new Promise<boolean>((resolve) => {
      pendingResolve = resolve
    })
  }

  function resolveDialog(value: boolean) {
    dialogState.value.open = false
    pendingResolve?.(value)
    pendingResolve = null
  }

  return { dialogState, confirm, resolveDialog }
}
