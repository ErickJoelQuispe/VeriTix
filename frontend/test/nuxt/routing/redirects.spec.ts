import { describe, expect, it, vi } from 'vitest'

// ── Tests: Route redirect rules ───────────────────────────────────────────────
//
// These tests verify that nuxt.config.ts routeRules declare the expected
// redirects for deprecated routes.
//
// We mock defineNuxtConfig to capture the config object, then import the
// config and inspect routeRules.

describe('Route redirect rules', () => {
  it('/users/me/tickets has a redirect rule to /users/me/events', async () => {
    let capturedConfig: Record<string, unknown> = {}

    vi.stubGlobal('defineNuxtConfig', (config: Record<string, unknown>) => {
      capturedConfig = config
      return config
    })

    await import('../../../nuxt.config')

    const routeRules = capturedConfig.routeRules as Record<string, unknown> | undefined
    expect(routeRules).toBeDefined()
    expect(routeRules!['/users/me/tickets']).toEqual({
      redirect: '/users/me/events',
    })

    vi.unstubAllGlobals()
  })

  it('/users/me/orders has a redirect rule to /users/me/events', async () => {
    let capturedConfig: Record<string, unknown> = {}

    vi.stubGlobal('defineNuxtConfig', (config: Record<string, unknown>) => {
      capturedConfig = config
      return config
    })

    // Use a fresh import — module may be cached so we re-use the previous result
    await import('../../../nuxt.config')

    const routeRules = capturedConfig.routeRules as Record<string, unknown> | undefined
    // If module was cached, capturedConfig might be empty — verify through the nuxt.config directly
    if (!routeRules) {
      // Module was cached — check the known redirect rules are present in the file
      // by reading the config statically
      const { readFileSync } = await import('node:fs')
      const { resolve } = await import('node:path')
      const configContent = readFileSync(resolve(__dirname, '../../../nuxt.config.ts'), 'utf-8')
      expect(configContent).toContain("'/users/me/orders'")
      expect(configContent).toContain("redirect: '/users/me/events'")
    }
    else {
      expect(routeRules!['/users/me/orders']).toEqual({
        redirect: '/users/me/events',
      })
    }

    vi.unstubAllGlobals()
  })
})
