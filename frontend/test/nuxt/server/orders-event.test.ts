import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const serverDir = join(process.cwd(), 'server')

describe('nitro proxy — GET /api/orders/event/[eventId]', () => {
  it('file exists at the expected path', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content.length).toBeGreaterThan(0)
  })

  it('extracts eventId via getRouterParam (not "id")', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content).toContain('getRouterParam(event, \'eventId\')')
  })

  it('calls proxyBackendRequest with the correct backend path', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content).toMatch(/proxyBackendRequest.*`\/orders\/event\/\$\{eventId\}`/)
  })

  it('forwards status as optional string query param', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content).toContain('readOptionalStringQuery')
    expect(content).toContain('\'status\'')
  })

  it('forwards page and limit query params', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content).toContain('readPageQuery')
    expect(content).toContain('readLimitQuery')
  })

  it('wraps query with withDefinedQuery', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content).toContain('withDefinedQuery')
  })

  it('uses GET method', async () => {
    const content = await readFile(
      join(serverDir, 'api/orders/event/[eventId].get.ts'),
      'utf-8',
    )
    expect(content).toContain('method: \'GET\'')
  })
})
