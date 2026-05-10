import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('publicArtistsRepository', () => {
  it('exporta usePublicArtistsRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/publicArtistsRepository.ts'), 'utf-8')
    expect(content).toContain('export function usePublicArtistsRepository()')
  })
})
