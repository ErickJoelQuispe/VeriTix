import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeFooter links', () => {
  it('includes genres and concert formats in the backoffice footer', async () => {
    const content = await readFile(join(appDir, 'components/layout/Footer.vue'), 'utf-8')

    expect(content).toContain('/backoffice/genres')
    expect(content).toContain('/backoffice/concert-formats')
    expect(content).toContain('Géneros')
    expect(content).toContain('Formatos')
  })
})
