import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('ticketTypesRepository', () => {
  it('exports useTicketTypesRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/ticketTypesRepository.ts'), 'utf-8')
    expect(content).toContain('export function useTicketTypesRepository()')
  })

  it('exposes getByEvent function', async () => {
    const content = await readFile(join(appDir, 'repositories/ticketTypesRepository.ts'), 'utf-8')
    expect(content).toContain('getByEvent')
  })

  it('calls the correct API endpoint for getByEvent', async () => {
    const content = await readFile(join(appDir, 'repositories/ticketTypesRepository.ts'), 'utf-8')
    expect(content).toContain('/api/events/')
    expect(content).toContain('ticket-types')
  })
})
