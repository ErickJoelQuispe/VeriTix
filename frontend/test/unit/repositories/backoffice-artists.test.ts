import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeArtistsRepository', () => {
  it('exporta useBackofficeArtistsRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeArtistsRepository.ts'), 'utf-8')
    expect(content).toContain('export function useBackofficeArtistsRepository()')
  })

  it('tiene las funciones CRUD esperadas', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeArtistsRepository.ts'), 'utf-8')

    expect(content).toContain('listArtists')
    expect(content).toContain('getArtist')
    expect(content).toContain('createArtist')
    expect(content).toContain('updateArtist')
    expect(content).toContain('deleteArtist')
  })
})
