import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('publicEventsRepository', () => {
  it('maps events with the expected helper functions and fallbacks', async () => {
    const content = await readFile(join(appDir, 'repositories/publicEventsRepository.ts'), 'utf-8')

    expect(content).toContain('export function toIsoString(')
    expect(content).toContain('export function buildEventFallbackImage(')
    expect(content).toContain('export function normalizeCurrencyCode(')
    expect(content).toContain('export function mapEventListItem(')
    expect(content).toContain('export function mapEventDetail(')
    expect(content).toContain('new Date().toISOString()')
    expect(content).toContain('buildEventFallbackImage(item.id)')
    expect(content).toContain("return 'EUR'")
  })

  it('uses the public events, genres, venues and artists endpoints', async () => {
    const content = await readFile(join(appDir, 'repositories/publicEventsRepository.ts'), 'utf-8')

    expect(content).toContain("'/events'")
    expect(content).toContain("'/genres'")
    expect(content).toContain("'/venues'")
    expect(content).toContain('`/events/${eventId}/artists`')
    expect(content).toContain('limit: 24')
    expect(content).toContain('artistName: filters.artistName')
    expect(content).toContain('venueName: filters.venueName')
    expect(content).toContain('dateFrom: filters.dateFrom')
    expect(content).toContain('dateTo: filters.dateTo')
  })
})
