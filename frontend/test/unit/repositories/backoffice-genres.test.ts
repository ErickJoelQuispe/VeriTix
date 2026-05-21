import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeGenresRepository', () => {
  it('uses the admin genres endpoints for CRUD', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeGenresRepository.ts'), 'utf-8')

    expect(content).toContain("'/admin/genres'")
    expect(content).toMatch(/`\/admin\/genres\/\$\{genreId\}`/)
    expect(content).toContain("method: 'GET'")
    expect(content).toContain("method: 'POST'")
    expect(content).toContain("method: 'PATCH'")
    expect(content).toContain("method: 'DELETE'")
  })
})
