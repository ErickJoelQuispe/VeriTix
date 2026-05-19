import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('pages/validator/index.vue', () => {
  it('file exists', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toBeTruthy()
  })

  it('uses validator layout and middleware via definePageMeta', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain("layout: 'validator'")
    expect(content).toContain("middleware: 'validator'")
  })

  it('renders Panel Validador heading', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain('Panel Validador')
  })

  it('has a button to navigate to /validator/scan', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain('/validator/scan')
  })

  it('has a manual input for payload', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain('v-model')
    expect(content).toContain('manualPayload')
  })

  it('uses useValidator composable', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain('useValidator')
  })

  it('calls submitPayload on manual submit', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain('submitPayload')
  })

  it('shows inline result when state is success or error', async () => {
    const content = await readFile(join(appDir, 'pages/validator/index.vue'), 'utf-8')
    expect(content).toContain("'success'")
    expect(content).toContain("'already_used'")
  })
})
