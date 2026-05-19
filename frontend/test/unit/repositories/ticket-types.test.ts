import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('ticketTypesRepository', () => {
  it('fetches ticket types from the event ticket-types endpoint', async () => {
    const content = await readFile(join(appDir, 'repositories/ticketTypesRepository.ts'), 'utf-8')

    expect(content).toContain('`/events/${eventId}/ticket-types`')
    expect(content).toContain("method: 'GET'")
    expect(content).toContain('apiRequest<TicketType[]>')
  })
})
