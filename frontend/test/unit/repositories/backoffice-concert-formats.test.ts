import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeConcertFormatsRepository', () => {
  it('uses the admin concert format endpoints for CRUD', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeConcertFormatsRepository.ts'), 'utf-8')

    expect(content).toContain("'/admin/concert-formats'")
    expect(content).toMatch(/`\/admin\/concert-formats\/\$\{formatId\}`/)
    expect(content).toContain("method: 'GET'")
    expect(content).toContain("method: 'POST'")
    expect(content).toContain("method: 'PATCH'")
    expect(content).toContain("method: 'DELETE'")
  })
})
