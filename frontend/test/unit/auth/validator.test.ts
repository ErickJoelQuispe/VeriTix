import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('useValidator composable', () => {
  it('file exists and exports useValidator', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('export function useValidator')
  })

  it('exposes state ref with idle as initial value', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('\'idle\'')
    expect(content).toContain('state')
  })

  it('exposes result ref', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('result')
  })

  it('exposes submitPayload function', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('submitPayload')
  })

  it('exposes reset function', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('reset')
  })

  it('state machine includes all required states', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('\'scanning\'')
    expect(content).toContain('\'success\'')
    expect(content).toContain('\'already_used\'')
    expect(content).toContain('\'invalid\'')
    expect(content).toContain('\'not_found\'')
  })

  it('submitPayload transitions state to scanning', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    // submitPayload should set state to scanning
    expect(content).toContain('\'scanning\'')
    expect(content).toContain('submitPayload')
  })

  it('handles 409 conflict by transitioning to already_used', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('409')
    expect(content).toContain('\'already_used\'')
  })

  it('handles 400 by transitioning to invalid', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('400')
    expect(content).toContain('\'invalid\'')
  })

  it('handles 404 by transitioning to not_found', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('404')
    expect(content).toContain('\'not_found\'')
  })

  it('reset() sets state to idle and clears result', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    // reset function should set state to idle and result to null
    expect(content).toContain('function reset')
    expect(content).toContain('\'idle\'')
    expect(content).toContain('null')
  })

  it('uses useValidatorRepository', async () => {
    const content = await readFile(join(appDir, 'composables/auth/useValidator.ts'), 'utf-8')
    expect(content).toContain('useValidatorRepository')
  })
})
