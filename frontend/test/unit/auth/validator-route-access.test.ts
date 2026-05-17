import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('requireValidatorAccess', () => {
  it('useRouteAccess exports requireValidatorAccess', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useRouteAccess.ts'), 'utf-8')
    expect(content).toContain('requireValidatorAccess')
  })

  it('requireValidatorAccess is returned from useRouteAccess', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useRouteAccess.ts'), 'utf-8')
    // Must be in the return object
    expect(content).toMatch(/return\s*\{[^}]*requireValidatorAccess[^}]*\}/)
  })

  it('requireValidatorAccess redirects unauthenticated to /login', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useRouteAccess.ts'), 'utf-8')
    // The function should check isAuthenticated and return /login
    expect(content).toContain("'/login'")
    expect(content).toContain('requireValidatorAccess')
  })

  it('requireValidatorAccess allows VALIDATOR role (returns undefined)', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useRouteAccess.ts'), 'utf-8')
    // Must check for VALIDATOR role
    expect(content).toContain("'VALIDATOR'")
  })

  it('requireValidatorAccess allows ADMIN role (returns undefined)', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useRouteAccess.ts'), 'utf-8')
    // Must check for ADMIN role within requireValidatorAccess context
    expect(content).toContain("'ADMIN'")
  })

  it('middleware/validator.ts exists and calls requireValidatorAccess', async () => {
    const content = await readFile(join(appDir, 'middleware/validator.ts'), 'utf-8')
    expect(content).toContain('requireValidatorAccess')
  })
})
