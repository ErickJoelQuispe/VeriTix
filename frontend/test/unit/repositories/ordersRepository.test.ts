import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('ordersRepository — listEventOrders', () => {
  it('exports listEventOrders from useOrdersRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toContain('listEventOrders')
  })

  it('calls the correct endpoint /orders/event/:eventId', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toMatch(/`\/orders\/event\/\$\{eventId\}`/)
  })

  it('uses compactQuery to forward status, page and limit', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toContain('compactQuery')
    expect(content).toContain('params.status')
    expect(content).toContain('params.page')
    expect(content).toContain('params.limit')
  })

  it('uses GET method for the request', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    // The listEventOrders function should use GET
    expect(content).toMatch(/listEventOrders[\s\S]*?method:\s*'GET'/)
  })

  it('returns listEventOrders from the composable return object', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toMatch(/return\s*\{[\s\S]*?listEventOrders[\s\S]*?\}/)
  })

  it('accepts eventId parameter for the endpoint', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')
    expect(content).toMatch(/function listEventOrders\s*\(\s*eventId/)
  })
})
