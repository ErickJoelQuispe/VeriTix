import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('ordersRepository', () => {
  it('uses the my-orders, order-detail, cancel and create endpoints', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')

    expect(content).toContain("'/orders/my'")
    expect(content).toContain('`/orders/${id}`')
    expect(content).toContain('`/orders/${id}/cancel`')
    expect(content).toContain("'/orders'")
  })

  it('maps paginated list items and preserves meta', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')

    expect(content).toContain('data: response.data.map(mapOrderListItem)')
    expect(content).toContain('meta: response.meta')
  })

  it('preserves checkoutUrl on createOrder responses', async () => {
    const content = await readFile(join(appDir, 'repositories/ordersRepository.ts'), 'utf-8')

    expect(content).toContain('...mapOrderDetail(response)')
    expect(content).toContain('checkoutUrl: response.checkoutUrl')
  })
})
