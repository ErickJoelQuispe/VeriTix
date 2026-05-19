export interface ValidateTicketResponse {
  ticketId: string
  eventName: string
  ticketTypeName: string
  buyerName: string
  validatedAt: string
}

export function useValidatorRepository() {
  const apiRequest = useApiRequest()

  async function validateTicket(payload: string): Promise<ValidateTicketResponse> {
    return await apiRequest<ValidateTicketResponse>('/tickets/validate', {
      method: 'POST',
      body: { payload },
    })
  }

  return {
    validateTicket,
  }
}
