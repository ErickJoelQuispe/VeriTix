import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('pages/validator/scan.vue', () => {
  it('file exists', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toBeTruthy()
  })

  it('uses validator layout and middleware via definePageMeta', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain("layout: 'validator'")
    expect(content).toContain("middleware: 'validator'")
  })

  it('does NOT import @zxing/browser at top-level (SSR safety)', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    // Top-level import would be: import ... from '@zxing/browser'
    // Only dynamic import inside onMounted is allowed
    expect(content).not.toMatch(/^import.*@zxing\/browser/m)
  })

  it('dynamically imports @zxing/browser inside onMounted', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain("@zxing/browser")
    expect(content).toContain('onMounted')
    // dynamic import pattern
    expect(content).toContain("import('@zxing/browser')")
  })

  it('calls submitPayload on QR decode', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('submitPayload')
  })

  it('stops camera on onUnmounted', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('onUnmounted')
  })

  it('uses useValidator composable', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('useValidator')
  })

  it('renders result cards for success state', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain("'success'")
  })

  it('renders result cards for already_used state', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain("'already_used'")
  })

  it('renders Ticket ya utilizado message', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('Ticket ya utilizado')
  })

  it('renders QR inválido message', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('QR inválido')
  })

  it('renders Ticket no encontrado message', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('Ticket no encontrado')
  })

  it('has Escanear otro button that calls reset', async () => {
    const content = await readFile(join(appDir, 'pages/validator/scan.vue'), 'utf-8')
    expect(content).toContain('Escanear otro')
    expect(content).toContain('reset()')
  })
})
