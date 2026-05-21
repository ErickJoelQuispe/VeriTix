import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const serverDir = join(process.cwd(), 'server')

describe('admin genres routes', () => {
  it('proxies genres CRUD to backend routes', async () => {
    const list = await readFile(join(serverDir, 'api/admin/genres.get.ts'), 'utf-8')
    const create = await readFile(join(serverDir, 'api/admin/genres.post.ts'), 'utf-8')
    const getOne = await readFile(join(serverDir, 'api/admin/genres/[id].get.ts'), 'utf-8')
    const update = await readFile(join(serverDir, 'api/admin/genres/[id].patch.ts'), 'utf-8')
    const remove = await readFile(join(serverDir, 'api/admin/genres/[id].delete.ts'), 'utf-8')

    expect(list).toContain("proxyBackendRequest")
    expect(list).toContain("'/genres'")
    expect(create).toContain("'/genres'")
    expect(getOne).toContain("`/genres/${id}`")
    expect(update).toContain("`/genres/${id}`")
    expect(remove).toContain("`/genres/${id}`")
  })
})
