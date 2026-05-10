import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeUsersRepository', () => {
  it('exporta useBackofficeUsersRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeUsersRepository.ts'), 'utf-8')
    expect(content).toContain('export function useBackofficeUsersRepository()')
  })

  it('tiene las funciones CRUD esperadas', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeUsersRepository.ts'), 'utf-8')

    expect(content).toContain('listUsers')
    expect(content).toContain('getUser')
    expect(content).toContain('createUser')
    expect(content).toContain('updateUser')
    expect(content).toContain('deleteUser')
  })
})
