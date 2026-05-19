import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('BackofficeHeader account menu', () => {
  it('includes Mis eventos and Panel Validador links', async () => {
    const content = await readFile(join(appDir, 'components/layout/BackofficeHeader.vue'), 'utf-8')
    expect(content).toContain('Mis eventos')
    expect(content).toContain('Panel Validador')
    expect(content).toContain('/users/me/events')
    expect(content).toContain('/validator')
  })
})
