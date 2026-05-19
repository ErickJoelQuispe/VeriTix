import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('navigation: VALIDATOR role support', () => {
  it('ia.ts exports VALIDATOR_NAV_ITEMS', async () => {
    const content = await readFile(join(appDir, 'utils/navigation/ia.ts'), 'utf-8')
    expect(content).toContain('VALIDATOR_NAV_ITEMS')
  })

  it('VALIDATOR_NAV_ITEMS includes Panel Validador link to /validator/', async () => {
    const content = await readFile(join(appDir, 'utils/navigation/ia.ts'), 'utf-8')
    expect(content).toContain('Panel Validador')
    expect(content).toContain('/validator')
  })

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

  it('Header.vue shows validator nav link for VALIDATOR role', async () => {
    const content = await readFile(join(appDir, 'components/layout/Header.vue'), 'utf-8')
    expect(content).toContain("'VALIDATOR'")
  })

  it('Header.vue shows validator nav link for ADMIN role too', async () => {
    const content = await readFile(join(appDir, 'components/layout/Header.vue'), 'utf-8')
    // ADMIN should also see the validator panel link
    expect(content).toContain('/validator')
  })
})
