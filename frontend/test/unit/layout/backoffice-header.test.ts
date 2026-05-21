import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')
const utilsDir = join(process.cwd(), 'app')

describe('backofficeHeader account menu', () => {
  it('includes Mis eventos and Panel Validador links', async () => {
    const content = await readFile(join(appDir, 'components/layout/BackofficeHeader.vue'), 'utf-8')
    expect(content).toContain('Mis eventos')
    expect(content).toContain('Panel Validador')
    expect(content).toContain('/users/me/events')
    expect(content).toContain('/validator')
  })

  it('includes genres and formats in the backoffice nav items', async () => {
    const content = await readFile(join(utilsDir, 'utils/navigation/ia.ts'), 'utf-8')

    expect(content).toContain('Géneros')
    expect(content).toContain('Formatos')
    expect(content).toContain('/backoffice/genres')
    expect(content).toContain('/backoffice/concert-formats')
    expect(content).not.toContain('layout-dashboard')
  })
})
