import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('arquitectura de repositorios', () => {
  it('directorio repositories existe', async () => {
    const files = await readdir(appDir)
    expect(files).toContain('repositories')
  })

  it('todos los repositorios están creados', async () => {
    const repoDir = join(appDir, 'repositories')
    const files = await readdir(repoDir)

    expect(files).toContain('publicEventsRepository.ts')
    expect(files).toContain('adminEventsRepository.ts')
    expect(files).toContain('adminUsersRepository.ts')
    expect(files).toContain('adminArtistsRepository.ts')
  })

  it('cada repositorio exporta su función factory', async () => {
    const checks = await Promise.all([
      readFile(join(appDir, 'repositories/publicEventsRepository.ts'), 'utf-8'),
      readFile(join(appDir, 'repositories/adminEventsRepository.ts'), 'utf-8'),
      readFile(join(appDir, 'repositories/adminUsersRepository.ts'), 'utf-8'),
      readFile(join(appDir, 'repositories/adminArtistsRepository.ts'), 'utf-8'),
    ])

    expect(checks[0]).toContain('export function usePublicEventsRepository()')
    expect(checks[1]).toContain('export function useAdminEventsRepository()')
    expect(checks[2]).toContain('export function useAdminUsersRepository()')
    expect(checks[3]).toContain('export function useAdminArtistsRepository()')
  })

  it('repo de eventos tiene las funciones crud', async () => {
    const content = await readFile(join(appDir, 'repositories/adminEventsRepository.ts'), 'utf-8')

    expect(content).toContain('listCatalog')
    expect(content).toContain('getEvent')
    expect(content).toContain('createEvent')
    expect(content).toContain('updateEvent')
    expect(content).toContain('deleteEvent')
  })

  it('repo de users tiene las funciones crud', async () => {
    const content = await readFile(join(appDir, 'repositories/adminUsersRepository.ts'), 'utf-8')

    expect(content).toContain('listUsers')
    expect(content).toContain('getUser')
    expect(content).toContain('createUser')
    expect(content).toContain('updateUser')
    expect(content).toContain('deleteUser')
  })

  it('repo de artists tiene las funciones crud', async () => {
    const content = await readFile(join(appDir, 'repositories/adminArtistsRepository.ts'), 'utf-8')

    expect(content).toContain('listArtists')
    expect(content).toContain('getArtist')
    expect(content).toContain('createArtist')
    expect(content).toContain('updateArtist')
    expect(content).toContain('deleteArtist')
  })
})

describe('arquitectura de route access', () => {
  it('useRouteAccess existe y tiene las funciones', async () => {
    const content = await readFile(join(appDir, 'composables/useRouteAccess.ts'), 'utf-8')

    expect(content).toContain('export function useRouteAccess()')
    expect(content).toContain('requireAuthenticated')
    expect(content).toContain('requireAdmin')
    expect(content).toContain('redirectIfAuthenticated')
  })
})
