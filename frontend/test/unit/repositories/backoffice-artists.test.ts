import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeArtistsRepository', () => {
  it('lists artists and genres through the admin endpoints', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeArtistsRepository.ts'), 'utf-8')

    expect(content).toContain('\'/genres\'')
    expect(content).toContain('\'/admin/artists\'')
    expect(content).toContain('page: pageValue')
    expect(content).toContain('limit: pageSize')
    expect(content).toContain('search')
    expect(content).toContain('genreId')
    expect(content).toContain('isActive')
  })

  it('supports artist detail and CRUD mutations', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeArtistsRepository.ts'), 'utf-8')

    expect(content).toMatch(/`\/admin\/artists\/\$\{artistId\}`/)
    expect(content).toContain('method: \'POST\'')
    expect(content).toContain('method: \'PATCH\'')
    expect(content).toContain('method: \'DELETE\'')
  })
})
