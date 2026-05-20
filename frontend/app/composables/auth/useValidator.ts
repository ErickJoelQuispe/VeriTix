import type { ValidateTicketResponse } from '@/repositories/validatorRepository'
import { useValidatorRepository } from '@/repositories/validatorRepository'

export type ValidatorState = 'idle' | 'scanning' | 'success' | 'already_used' | 'invalid' | 'not_found'

export function useValidator() {
  const { validateTicket } = useValidatorRepository()

  const state = ref<ValidatorState>('idle')
  const result = ref<ValidateTicketResponse | null>(null)

  async function submitPayload(payload: string): Promise<void> {
    state.value = 'scanning'
    result.value = null

    try {
      const data = await validateTicket(payload)
      result.value = data
      state.value = 'success'
    }
    catch (error: unknown) {
      const statusCode = extractStatusCode(error)

      if (statusCode === 409) {
        state.value = 'already_used'
      }
      else if (statusCode === 400) {
        state.value = 'invalid'
      }
      else if (statusCode === 404) {
        state.value = 'not_found'
      }
      else {
        state.value = 'invalid'
      }
    }
  }

  function reset(): void {
    state.value = 'idle'
    result.value = null
  }

  return {
    state,
    result,
    submitPayload,
    reset,
  }
}

function extractStatusCode(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    if (typeof err.statusCode === 'number') { return err.statusCode }
    if (typeof err.status === 'number') { return err.status }
    if (err.response && typeof err.response === 'object') {
      const res = err.response as Record<string, unknown>
      if (typeof res.status === 'number') { return res.status }
      if (typeof res.statusCode === 'number') { return res.statusCode }
    }
  }
  return null
}
