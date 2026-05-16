import type { CreateTransferPayload, TicketTransfer, TransferResult } from '~~/shared/types'

export function useTicketTransfersRepository() {
  const apiRequest = useApiRequest()

  /**
   * POST /ticket-transfers
   * Initiates a ticket transfer to a recipient email (BUYER only).
   * Returns the created TicketTransfer record.
   */
  async function initiateTransfer(payload: CreateTransferPayload): Promise<TicketTransfer> {
    return apiRequest<TicketTransfer, CreateTransferPayload>('/ticket-transfers', {
      method: 'POST',
      body: payload,
    })
  }

  /**
   * POST /ticket-transfers/complete-after-register
   * Completes a pending transfer after the recipient registers.
   * The transfer token must have been stored client-side from a prior accept response.
   */
  async function completeTransferAfterRegister(transferToken: string): Promise<TransferResult> {
    return apiRequest<TransferResult, { transferToken: string }>('/ticket-transfers/complete-after-register', {
      method: 'POST',
      body: { transferToken },
    })
  }

  return {
    initiateTransfer,
    completeTransferAfterRegister,
  }
}
