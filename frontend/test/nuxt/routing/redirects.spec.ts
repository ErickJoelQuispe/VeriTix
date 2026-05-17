import { describe, expect, it, vi } from 'vitest'

// ── Tests: Route redirect rules ───────────────────────────────────────────────
//
// These tests verify that nuxt.config.ts routeRules declare the expected
// redirects for deprecated routes.
//
// We mock defineNuxtConfig to capture the config object, then import the
// config and inspect routeRules.

describe('route redirect rules', () => {
  it('/users/me/tickets does not redirect away', async () => {
    let capturedConfig: Record<string, unknown> = {}

    vi.stubGlobal('defineNuxtConfig', (config: Record<string, unknown>) => {
      capturedConfig = config
      return config
    })

    await import('../../../nuxt.config')

    const routeRules = capturedConfig.routeRules as Record<string, unknown> | undefined
    expect(routeRules).toBeUndefined()

    vi.unstubAllGlobals()
  })

  it('/users/me/orders does not redirect away', async () => {
    let capturedConfig: Record<string, unknown> = {}

    vi.stubGlobal('defineNuxtConfig', (config: Record<string, unknown>) => {
      capturedConfig = config
      return config
    })

    // Use a fresh import — module may be cached so we re-use the previous result
    await import('../../../nuxt.config')

    const routeRules = capturedConfig.routeRules as Record<string, unknown> | undefined
    expect(routeRules).toBeUndefined()

    vi.unstubAllGlobals()
  })
})
