import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeEventsRepository', () => {
  it('exporta useBackofficeEventsRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeEventsRepository.ts'), 'utf-8')
    expect(content).toContain('export function useBackofficeEventsRepository()')
  })

  it('tiene las funciones CRUD esperadas', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeEventsRepository.ts'), 'utf-8')

    expect(content).toContain('listCatalog')
    expect(content).toContain('getEvent')
    expect(content).toContain('createEvent')
    expect(content).toContain('updateEvent')
    expect(content).toContain('deleteEvent')
  })
})
