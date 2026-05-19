import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('validator layout', () => {
  it('layouts/validator.vue exists', async () => {
    const content = await readFile(join(appDir, 'layouts/validator.vue'), 'utf-8')
    expect(content).toBeTruthy()
  })

  it('validator.vue uses LayoutValidatorHeader', async () => {
    const content = await readFile(join(appDir, 'layouts/validator.vue'), 'utf-8')
    expect(content).toContain('LayoutValidatorHeader')
  })

  it('validator.vue has a <slot />', async () => {
    const content = await readFile(join(appDir, 'layouts/validator.vue'), 'utf-8')
    expect(content).toContain('<slot')
  })
})

describe('ValidatorHeader component', () => {
  it('components/layout/ValidatorHeader.vue exists', async () => {
    const content = await readFile(join(appDir, 'components/layout/ValidatorHeader.vue'), 'utf-8')
    expect(content).toBeTruthy()
  })

  it('ValidatorHeader.vue renders brand text VeriTix', async () => {
    const content = await readFile(join(appDir, 'components/layout/ValidatorHeader.vue'), 'utf-8')
    expect(content).toContain('VeriTix')
  })

  it('ValidatorHeader.vue shows Panel Validador title', async () => {
    const content = await readFile(join(appDir, 'components/layout/ValidatorHeader.vue'), 'utf-8')
    expect(content).toContain('Panel Validador')
  })

  it('ValidatorHeader.vue includes account menu or user info', async () => {
    const content = await readFile(join(appDir, 'components/layout/ValidatorHeader.vue'), 'utf-8')
    // Should have account menu like BackofficeHeader
    expect(content).toContain('UiAccountMenu')
  })
})
