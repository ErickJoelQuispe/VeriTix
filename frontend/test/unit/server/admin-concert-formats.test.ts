import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const serverDir = join(process.cwd(), 'server')

describe('admin concert format routes', () => {
  it('proxies concert format CRUD to backend routes', async () => {
    const list = await readFile(join(serverDir, 'api/admin/concert-formats.get.ts'), 'utf-8')
    const create = await readFile(join(serverDir, 'api/admin/concert-formats.post.ts'), 'utf-8')
    const getOne = await readFile(join(serverDir, 'api/admin/concert-formats/[id].get.ts'), 'utf-8')
    const update = await readFile(join(serverDir, 'api/admin/concert-formats/[id].patch.ts'), 'utf-8')
    const remove = await readFile(join(serverDir, 'api/admin/concert-formats/[id].delete.ts'), 'utf-8')

    expect(list).toContain("proxyBackendRequest")
    expect(list).toContain("'/concert-formats'")
    expect(create).toContain("'/concert-formats'")
    expect(getOne).toContain("`/concert-formats/${id}`")
    expect(update).toContain("`/concert-formats/${id}`")
    expect(remove).toContain("`/concert-formats/${id}`")
  })
})
