import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('publicArtistsRepository', () => {
  it('lists artists from the public artists endpoint with normalized filters', async () => {
    const content = await readFile(join(appDir, 'repositories/publicArtistsRepository.ts'), 'utf-8')

    expect(content).toContain("'/artists'")
    expect(content).toContain('limit: 24')
    expect(content).toContain('search: filters.search')
    expect(content).toContain('genreId: filters.genreId')
    expect(content).toContain('country: filters.country')
    expect(content).toContain('isActive: filters.isActive')
  })

  it('fetches artist details by id', async () => {
    const content = await readFile(join(appDir, 'repositories/publicArtistsRepository.ts'), 'utf-8')

    expect(content).toContain('`/artists/${id}`')
    expect(content).toContain("method: 'GET'")
  })
})
