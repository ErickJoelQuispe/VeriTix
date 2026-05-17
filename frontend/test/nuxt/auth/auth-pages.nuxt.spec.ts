import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import ForgotPasswordPage from '@/pages/forgot-password.vue'
import LoginPage from '@/pages/login.vue'
import RegisterPage from '@/pages/register.vue'
import VerifyEmailPage from '@/pages/verify-email.vue'

let defaultAuthMock: any

const {
  ensureSessionMock,
  loginMock,
  navigateToMock,
  notifyApiErrorMock,
  notifySuccessMock,
  forgotPasswordMock,
  verifyEmailMock,
  routeMock,
  registerMock,
  useAppNotificationsMock,
  useAuthMock,
  useRouteMock,
  onNuxtReadyMock,
} = vi.hoisted(() => {
  const notifyApiErrorMock = vi.fn()
  const notifySuccessMock = vi.fn()
  const routeMock = { query: { token: 'verification-token-123' } }

  return {
    ensureSessionMock: vi.fn().mockResolvedValue(false),
    loginMock: vi.fn(),
    navigateToMock: vi.fn((to: string) => to),
    notifyApiErrorMock,
    notifySuccessMock,
    forgotPasswordMock: vi.fn(),
    verifyEmailMock: vi.fn(),
    routeMock,
    registerMock: vi.fn(),
    useAppNotificationsMock: vi.fn(() => ({
      notifyApiError: notifyApiErrorMock,
      notifySuccess: notifySuccessMock,
    })),
    useAuthMock: vi.fn(() => defaultAuthMock),
    useRouteMock: vi.fn(() => routeMock),
    onNuxtReadyMock: vi.fn((callback: () => void) => callback()),
  }
})

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useAppNotifications', () => useAppNotificationsMock)
mockNuxtImport('useAuth', () => useAuthMock)
mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('onNuxtReady', () => onNuxtReadyMock)

defaultAuthMock = {
  ensureSession: vi.fn().mockResolvedValue(false),
  isAuthenticated: ref(false),
  login: vi.fn(),
  pending: ref(false),
  forgotPassword: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  refreshStatus: ref('idle'),
  sessionStatus: ref('unknown'),
  user: ref(null),
}

function mockGuestAuth() {
  useAuthMock.mockReturnValue({
    ensureSession: ensureSessionMock,
    isAuthenticated: ref(false),
    forgotPassword: forgotPasswordMock,
    login: loginMock,
    pending: ref(false),
    refreshStatus: ref('idle'),
    register: registerMock,
    verifyEmail: verifyEmailMock,
    sessionStatus: ref('unknown'),
    user: ref(null),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  ensureSessionMock.mockResolvedValue(false)
  mockGuestAuth()
  routeMock.query.token = 'verification-token-123'
  forgotPasswordMock.mockResolvedValue({ message: 'If that email exists, you\'ll receive a reset link shortly' })
  registerMock.mockResolvedValue({ message: 'Revisá tu email para verificar tu cuenta' })
  verifyEmailMock.mockResolvedValue({ message: 'Email verificado correctamente' })
})

describe('login page', () => {
  it('normaliza email, autentica y navega al inicio', async () => {
    loginMock.mockResolvedValueOnce(undefined)

    const wrapper = await mountSuspended(LoginPage)

    await wrapper.get('input[name="email"]').setValue('  USER@Example.COM  ')
    await wrapper.get('input[name="password"]').setValue('Password1')
    await wrapper.get('form').trigger('submit')

    await flushPromises()

    expect(loginMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password1',
    })
    expect(notifySuccessMock).toHaveBeenCalledWith('Sesión iniciada correctamente.', { id: 'auth-login-success' })
    expect(notifyApiErrorMock).not.toHaveBeenCalled()
    expect(navigateToMock).toHaveBeenCalledWith('/')
  })

  it('reporta el error y no navega cuando falla', async () => {
    const error = new Error('Invalid credentials')
    loginMock.mockRejectedValueOnce(error)

    const wrapper = await mountSuspended(LoginPage)

    await wrapper.get('input[name="email"]').setValue('user@example.com')
    await wrapper.get('input[name="password"]').setValue('Password1')
    await wrapper.get('form').trigger('submit')

    await flushPromises()

    expect(notifyApiErrorMock).toHaveBeenCalledWith(
      error,
      'Credenciales incorrectas. Por favor, intentá de nuevo.',
      { id: 'auth-login-error' },
    )
    expect(notifySuccessMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

describe('register page', () => {
  it('normaliza el payload y muestra el aviso de verificación', async () => {
    const wrapper = await mountSuspended(RegisterPage)

    await wrapper.get('input[name="name"]').setValue('Ana')
    await wrapper.get('input[name="lastName"]').setValue('Pérez')
    await wrapper.get('input[name="email"]').setValue('ANA@Example.COM')
    await wrapper.get('input[name="phone"]').setValue('+34958123456')
    await wrapper.get('input[name="password"]').setValue('Password1')
    await wrapper.get('input[name="confirmPassword"]').setValue('Password1')
    await wrapper.get('form').trigger('submit')

    await flushPromises()

    expect(registerMock).toHaveBeenCalledWith({
      email: 'ana@example.com',
      name: 'Ana',
      lastName: 'Pérez',
      password: 'Password1',
      phone: '+34958123456',
    })
    expect(notifySuccessMock).toHaveBeenCalledWith(
      'Revisá tu email para verificar tu cuenta',
      { id: 'auth-register-success' },
    )
    expect(notifyApiErrorMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Revisá tu email para verificar tu cuenta')
  })

  it('reporta el error y no navega cuando falla', async () => {
    const error = new Error('Registration failed')
    registerMock.mockRejectedValueOnce(error)

    const wrapper = await mountSuspended(RegisterPage)

    await wrapper.get('input[name="name"]').setValue('Ana')
    await wrapper.get('input[name="lastName"]').setValue('Pérez')
    await wrapper.get('input[name="email"]').setValue('ana@example.com')
    await wrapper.get('input[name="phone"]').setValue('+34958123456')
    await wrapper.get('input[name="password"]').setValue('Password1')
    await wrapper.get('input[name="confirmPassword"]').setValue('Password1')
    await wrapper.get('form').trigger('submit')

    await flushPromises()

    expect(notifyApiErrorMock).toHaveBeenCalledWith(
      error,
      'Error al crear la cuenta. Por favor, intentá de nuevo.',
      { id: 'auth-register-error' },
    )
    expect(notifySuccessMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

describe('verify email page', () => {
  it('verifica el correo y muestra el estado exitoso', async () => {
    const wrapper = await mountSuspended(VerifyEmailPage)

    await flushPromises()

    expect(verifyEmailMock).toHaveBeenCalledWith({ token: 'verification-token-123' })
    expect(wrapper.text()).toContain('Email verificado correctamente')
  })

  it('muestra un error cuando falta el token', async () => {
    routeMock.query.token = ''

    const wrapper = await mountSuspended(VerifyEmailPage)

    await flushPromises()

    expect(verifyEmailMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Falta el token de verificación.')
  })
})

describe('forgot password page', () => {
  it('solicita el enlace de recuperación y muestra el estado final', async () => {
    const wrapper = await mountSuspended(ForgotPasswordPage)

    expect(wrapper.text()).not.toContain('Revisá tu correo: si existe una cuenta, ya te mandamos el enlace.')

    await wrapper.get('input[name="email"]').setValue('recover@example.com')
    await wrapper.get('form').trigger('submit')

    await flushPromises()

    expect(forgotPasswordMock).toHaveBeenCalledWith('recover@example.com')
    expect(notifySuccessMock).toHaveBeenCalledWith('If that email exists, you\'ll receive a reset link shortly', { id: 'auth-forgot-password-success' })
    expect(wrapper.text()).toContain('If that email exists, you\'ll receive a reset link shortly')
  })
})
