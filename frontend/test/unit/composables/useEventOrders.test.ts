import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('useEventOrders — structure', () => {
  it('exports useEventOrders function', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('export function useEventOrders')
  })

  it('exposes orders, meta, isLoading, error reactive refs', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('orders')
    expect(content).toContain('meta')
    expect(content).toContain('isLoading')
    expect(content).toContain('error')
  })

  it('initializes isLoading as false', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('ref(false)')
  })

  it('initializes error as null', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    // error ref initialized to null (typed or untyped)
    expect(content).toMatch(/error\s*=\s*ref[^(]*\(null\)/)
  })

  it('exposes fetch method', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('function fetch(')
  })

  it('exposes setPage method', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('function setPage(')
  })

  it('exposes setStatusFilter method', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('function setStatusFilter(')
  })

  it('calls listEventOrders from repository', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('listEventOrders')
  })

  it('returns all state and methods', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toMatch(/return\s*\{[\s\S]*?orders[\s\S]*?\}/)
    expect(content).toMatch(/return\s*\{[\s\S]*?fetch[\s\S]*?\}/)
    expect(content).toMatch(/return\s*\{[\s\S]*?setPage[\s\S]*?\}/)
    expect(content).toMatch(/return\s*\{[\s\S]*?setStatusFilter[\s\S]*?\}/)
  })

  it('setPage updates page ref and calls fetch', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('page.value')
    expect(content).toMatch(/setPage[\s\S]*?fetch\(\)/)
  })

  it('setStatusFilter resets page to 1 and calls fetch', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('statusFilter')
    // setStatusFilter must reset page to 1 before fetching
    expect(content).toMatch(/setStatusFilter[\s\S]*?page\.value\s*=\s*1/)
  })

  it('sets isLoading true during fetch and false after', async () => {
    const content = await readFile(
      join(appDir, 'composables/auth/useEventOrders.ts'),
      'utf-8',
    )
    expect(content).toContain('isLoading.value = true')
    expect(content).toContain('isLoading.value = false')
  })
})
