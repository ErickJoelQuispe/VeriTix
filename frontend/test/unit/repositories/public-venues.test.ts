import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('publicVenuesRepository', () => {
  it('lists venues with the public venues filters and fixed limit', async () => {
    const content = await readFile(join(appDir, 'repositories/publicVenuesRepository.ts'), 'utf-8')

    expect(content).toContain("'/venues'")
    expect(content).toContain('limit: 24')
    expect(content).toContain('search: filters.search')
    expect(content).toContain('city: filters.city')
    expect(content).toContain('type: filters.type')
    expect(content).toContain('isActive: filters.isActive')
  })

  it('fetches venue details by id', async () => {
    const content = await readFile(join(appDir, 'repositories/publicVenuesRepository.ts'), 'utf-8')

    expect(content).toContain('`/venues/${id}`')
    expect(content).toContain("method: 'GET'")
  })
})
