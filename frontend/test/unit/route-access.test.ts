import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('arquitectura de route access', () => {
  it('useRouteAccess existe y tiene las funciones', async () => {
    const content = await readFile(join(appDir, 'composables/useRouteAccess.ts'), 'utf-8')

    expect(content).toContain('export function useRouteAccess()')
    expect(content).toContain('requireAuthenticated')
    expect(content).toContain('requireAdmin')
    expect(content).toContain('redirectIfAuthenticated')
  })
})
