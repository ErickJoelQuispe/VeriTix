import { describe, expect, it } from 'vitest'

import { useApiErrorMessage } from '@/composables/api/useApiErrorMessage'

describe('useApiErrorMessage', () => {
  const {
    getApiErrorStatus,
    getApiErrorMessage,
    isApiAuthError,
    isApiForbiddenError,
    isApiTimeoutError,
    isApiSessionExpiredError,
    markApiSessionExpiredError,
  } = useApiErrorMessage()

  describe('getApiErrorStatus', () => {
    it('extrae status desde response.status', () => {
      expect(getApiErrorStatus({ response: { status: 422 } })).toBe(422)
    })

    it('extrae status desde statusCode directo', () => {
      expect(getApiErrorStatus({ statusCode: 409 })).toBe(409)
    })

    it('extrae status desde data.statusCode', () => {
      expect(getApiErrorStatus({ data: { statusCode: 404 } })).toBe(404)
    })

    it('retorna undefined si no hay status en ninguna forma', () => {
      expect(getApiErrorStatus({})).toBeUndefined()
    })
  })

  describe('isApiAuthError', () => {
    it('detecta 401 como error de autenticación', () => {
      expect(isApiAuthError({ response: { status: 401 } })).toBe(true)
    })

    it('403 NO es error de auth', () => {
      expect(isApiAuthError({ statusCode: 403 })).toBe(false)
    })

    it('422 NO es error de auth', () => {
      expect(isApiAuthError({ statusCode: 422 })).toBe(false)
    })
  })

  describe('isApiForbiddenError', () => {
    it('detecta 403 como error de permisos', () => {
      expect(isApiForbiddenError({ statusCode: 403 })).toBe(true)
    })

    it('401 NO es error de permisos', () => {
      expect(isApiForbiddenError({ statusCode: 401 })).toBe(false)
    })
  })

  describe('isApiTimeoutError', () => {
    it('detecta AbortError como timeout', () => {
      expect(isApiTimeoutError({ name: 'AbortError' })).toBe(true)
    })

    it('detecta mensaje con timeout como timeout', () => {
      expect(isApiTimeoutError({ message: 'timeout of 8000ms exceeded' })).toBe(true)
    })

    it('otros errores NO son timeout', () => {
      expect(isApiTimeoutError({ name: 'Error', message: 'not found' })).toBe(false)
    })
  })

  describe('isApiSessionExpiredError y markApiSessionExpiredError', () => {
    it('marca un error como session expired y lo detecta', () => {
      const error = new Error('test')
      const marked = markApiSessionExpiredError(error)

      expect(marked).toBe(error)
      expect(isApiSessionExpiredError(marked)).toBe(true)
    })

    it('objetos no-error también se pueden marcar', () => {
      const error = { message: 'fail' }
      const marked = markApiSessionExpiredError(error)

      expect(isApiSessionExpiredError(marked)).toBe(true)
    })
  })

  describe('getApiErrorMessage', () => {
    it('prioriza mensaje de timeout ante un AbortError', () => {
      expect(getApiErrorMessage({ name: 'AbortError' }, 'Fallback'))
        .toBe('La conexión tardó demasiado. Reintentá en unos segundos.')
    })

    it('prioriza mensaje de timeout si el error dice timeout', () => {
      expect(getApiErrorMessage({ message: 'timeout of 8000ms exceeded' }, 'Fallback'))
        .toBe('La conexión tardó demasiado. Reintentá en unos segundos.')
    })

    it('concatena array de mensajes del payload', () => {
      expect(getApiErrorMessage({
        data: { message: ['Email inválido', 'Password corto'] },
      }, 'Fallback')).toBe('Email inválido, Password corto')
    })

    it('usa mensaje string del payload', () => {
      expect(getApiErrorMessage({
        data: { message: 'No autorizado' },
      }, 'Fallback')).toBe('No autorizado')
    })

    it('usa error string del payload cuando no hay message', () => {
      expect(getApiErrorMessage({
        data: { error: 'Conflicto' },
      }, 'Fallback')).toBe('Conflicto')
    })

    it('usa mensaje directo del error', () => {
      expect(getApiErrorMessage({ message: 'Network Error' }, 'Fallback')).toBe('Network Error')
    })

    it('cae al fallback cuando no hay nada', () => {
      expect(getApiErrorMessage({}, 'Fallback')).toBe('Fallback')
    })
  })
})
