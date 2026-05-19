import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('navigation: VALIDATOR role support', () => {
  it('useAccountMenuItems accepts isValidatorUser flag', async () => {
    const content = await readFile(join(appDir, 'composables/ui/useAccountMenuItems.ts'), 'utf-8')
    // Should accept a validator user flag
    expect(content).toContain('isValidatorUser')
  })

  it('useAccountMenuItems adds Panel Validador item for validator users', async () => {
    const content = await readFile(join(appDir, 'composables/ui/useAccountMenuItems.ts'), 'utf-8')
    expect(content).toContain('Panel Validador')
    expect(content).toContain('/validator')
  })

  it('Header.vue does not render a separate validator nav button', async () => {
    const content = await readFile(join(appDir, 'components/layout/Header.vue'), 'utf-8')
    expect(content).not.toContain('Panel Validador')
  })
})
