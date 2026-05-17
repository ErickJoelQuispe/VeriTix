import type { CreateTransferPayload, TicketTransfer } from '~~/shared/types'
import { useTicketTransfersRepository } from '@/repositories/ticketTransfersRepository'

export function useTicketTransfer() {
  const { initiateTransfer } = useTicketTransfersRepository()

  const isLoading = ref(false)

  /**
   * Initiates a ticket transfer to the given recipient email.
   * Returns the created TicketTransfer or throws on error.
   */
  async function initiateTicketTransfer(payload: CreateTransferPayload): Promise<TicketTransfer> {
    isLoading.value = true

    try {
      return await initiateTransfer(payload)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    initiateTicketTransfer,
  }
}
