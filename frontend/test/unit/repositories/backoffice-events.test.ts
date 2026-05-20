import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')
const serverDir = join(process.cwd(), 'server')

describe('backofficeEventsRepository', () => {
  it('loads form options from venues, genres and concert formats', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeEventsRepository.ts'), 'utf-8')

    expect(content).toContain('Promise.all([')
    expect(content).toContain('\'/venues\'')
    expect(content).toContain('\'/genres\'')
    expect(content).toContain('\'/concert-formats\'')
    expect(content).toContain('formats: (formatsResponse ?? []).map')
  })

  it('supports catalog, attention, detail and CRUD endpoints', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeEventsRepository.ts'), 'utf-8')

    expect(content).toContain('\'/admin/events\'')
    expect(content).toContain('\'/admin/events/requires-attention\'')
    expect(content).toContain('buildCatalogQuery({')
    expect(content).toContain('pageValue')
    expect(content).toContain('pageSize')
    expect(content).toContain('filters')
    expect(content).toContain('quickWindow')
    expect(content).toMatch(/`\/admin\/events\/\$\{eventId\}`/)
    expect(content).toContain('method: \'POST\'')
    expect(content).toContain('method: \'PATCH\'')
    expect(content).toContain('method: \'DELETE\'')
  })

  it('uses admin-detail backend endpoint for backoffice event edit proxy', async () => {
    const content = await readFile(join(serverDir, 'api/admin/events/[id].get.ts'), 'utf-8')

    expect(content).toContain('`/events/${id}/admin-detail`')
  })
})
