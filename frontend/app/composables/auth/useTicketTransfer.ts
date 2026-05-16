import type { CreateTransferPayload, TicketTransfer } from '~~/shared/types'
import { useTicketTransfersRepository } from '@/repositories/ticketTransfersRepository'

export function useTicketTransfer() {
  const { initiateTransfer } = useTicketTransfersRepository()
  const { getApiErrorMessage } = useApiErrorMessage()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  /**
   * Initiates a ticket transfer to the given recipient email.
   * Returns the created TicketTransfer or throws on error.
   */
  async function initiateTicketTransfer(payload: CreateTransferPayload): Promise<TicketTransfer> {
    isLoading.value = true
    error.value = null
    success.value = false

    try {
      const transfer = await initiateTransfer(payload)
      success.value = true
      return transfer
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos completar la transferencia.')
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Resets the composable state (error and success).
   */
  function resetState(): void {
    error.value = null
    success.value = false
  }

  return {
    isLoading,
    error,
    success,
    initiateTicketTransfer,
    resetState,
  }
}
