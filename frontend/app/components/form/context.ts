import { inject } from 'vue'
import type { InjectionKey } from 'vue'

export interface FormContext {
  errors: Record<string, string>
  clearError: (name: string) => void
}

export const formContextKey: InjectionKey<FormContext> = Symbol('form-context')

export function useFormContext(): FormContext | null {
  return inject(formContextKey, null)
}
