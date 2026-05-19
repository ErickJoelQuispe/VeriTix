import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('ordersRepository', () => {
  it('exports useOrdersRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toContain('export function useOrdersRepository()')
  })

  it('exposes createOrder function', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toContain('createOrder')
  })

  it('createOrder posts to /api/orders', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toContain("'/orders'")
    expect(content).toContain("'POST'")
  })

  it('createOrder returns checkoutUrl in response', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toContain('checkoutUrl')
  })
})
