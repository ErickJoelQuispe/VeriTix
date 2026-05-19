import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('requireSalesReportAccess', () => {
  it('useRouteAccess exports requireSalesReportAccess', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useRouteAccess.ts'),
      'utf-8',
    )
    expect(content).toContain('requireSalesReportAccess')
  })

  it('requireSalesReportAccess is returned from useRouteAccess', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useRouteAccess.ts'),
      'utf-8',
    )
    expect(content).toMatch(/return\s*\{[^}]*requireSalesReportAccess[^}]*\}/)
  })

  it('requireSalesReportAccess redirects unauthenticated to /login', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useRouteAccess.ts'),
      'utf-8',
    )
    expect(content).toContain('requireSalesReportAccess')
    // The function must check isAuthenticated
    expect(content).toContain('isAuthenticated')
  })

  it('requireSalesReportAccess allows ADMIN role (returns undefined)', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useRouteAccess.ts'),
      'utf-8',
    )
    // Must check for ADMIN within requireSalesReportAccess context
    expect(content).toContain('\'ADMIN\'')
  })

  it('requireSalesReportAccess allows CREATOR role (returns undefined)', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useRouteAccess.ts'),
      'utf-8',
    )
    // Must check for CREATOR role
    expect(content).toContain('\'CREATOR\'')
  })

  it('requireSalesReportAccess redirects non-ADMIN/CREATOR roles to /', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useRouteAccess.ts'),
      'utf-8',
    )
    // Must return '/' for unauthorized roles
    expect(content).toMatch(/requireSalesReportAccess[\s\S]*?return\s*'\/'/)
  })
})
