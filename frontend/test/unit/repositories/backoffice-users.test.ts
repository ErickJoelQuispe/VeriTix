import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('backofficeUsersRepository', () => {
  it('lists users with pageValue/pageSize mapped to page/limit', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeUsersRepository.ts'), 'utf-8')

    expect(content).toContain('\'/admin/users\'')
    expect(content).toContain('page: pageValue')
    expect(content).toContain('limit: pageSize')
    expect(content).toContain('search')
    expect(content).toContain('role')
    expect(content).toContain('isActive')
  })

  it('supports CRUD and email lookup helpers', async () => {
    const content = await readFile(join(appDir, 'repositories/backofficeUsersRepository.ts'), 'utf-8')

    expect(content).toMatch(/`\/admin\/users\/\$\{userId\}`/)
    expect(content).toContain('\'/admin/users/by-email\'')
    expect(content).toContain('method: \'DELETE\'')
    expect(content).toContain('method: \'PATCH\'')
    expect(content).toContain('trimToUndefined(email.toLowerCase())')
    expect(content).toContain('existingUser.id !== excludeUserId')
  })
})
