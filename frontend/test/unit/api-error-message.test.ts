import { describe, expect, it } from 'vitest'

import { useApiErrorMessage } from '../../app/composables/useApiErrorMessage'

describe('useApiErrorMessage', () => {
  const { getApiErrorMessage, getApiErrorStatus, isApiAuthError } = useApiErrorMessage()

  it('extrae status desde distintas formas del error', () => {
    expect(getApiErrorStatus({ response: { status: 422 } })).toBe(422)
    expect(getApiErrorStatus({ statusCode: 409 })).toBe(409)
    expect(getApiErrorStatus({ data: { statusCode: 404 } })).toBe(404)
  })

  it('detecta errores de autenticación', () => {
    expect(isApiAuthError({ response: { status: 401 } })).toBe(true)
    expect(isApiAuthError({ statusCode: 403 })).toBe(true)
    expect(isApiAuthError({ statusCode: 422 })).toBe(false)
  })

  it('prioriza mensajes del payload y luego fallback', () => {
    expect(getApiErrorMessage({
      data: { message: ['Email inválido', 'Password corto'] },
    }, 'Fallback')).toBe('Email inválido, Password corto')

    expect(getApiErrorMessage({
      data: { message: 'No autorizado' },
    }, 'Fallback')).toBe('No autorizado')

    expect(getApiErrorMessage({
      data: { error: 'Conflicto' },
    }, 'Fallback')).toBe('Conflicto')

    expect(getApiErrorMessage({
      message: 'Network Error',
    }, 'Fallback')).toBe('Network Error')

    expect(getApiErrorMessage({}, 'Fallback')).toBe('Fallback')
  })
})
