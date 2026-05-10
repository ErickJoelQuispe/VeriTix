import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('repositories directory', () => {
  it('existe y contiene todos los repos esperados', async () => {
    const files = await readdir(join(appDir, 'repositories'))

    expect(files).toContain('publicEventsRepository.ts')
    expect(files).toContain('publicArtistsRepository.ts')
    expect(files).toContain('publicVenuesRepository.ts')
    expect(files).toContain('backofficeEventsRepository.ts')
    expect(files).toContain('backofficeUsersRepository.ts')
    expect(files).toContain('backofficeArtistsRepository.ts')
  })
})
