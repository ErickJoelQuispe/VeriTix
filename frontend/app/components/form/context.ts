import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export interface FormContext {
  errors: Record<string, string>
  clearError: (name: string) => void
}

export const formContextKey: InjectionKey<FormContext> = Symbol('form-context')

export function useFormContext(): FormContext | null {
  return inject(formContextKey, null)
}
