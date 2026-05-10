import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('publicVenuesRepository', () => {
  it('exporta usePublicVenuesRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/publicVenuesRepository.ts'), 'utf-8')
    expect(content).toContain('export function usePublicVenuesRepository()')
  })
})
