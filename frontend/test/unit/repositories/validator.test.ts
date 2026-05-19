import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('validatorRepository', () => {
  it('posts ticket payloads to the validate endpoint', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')

    expect(content).toContain("'/tickets/validate'")
    expect(content).toContain("method: 'POST'")
    expect(content).toContain('body: { payload }')
  })

  it('keeps the response contract fields intact', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')

    expect(content).toContain('ticketId')
    expect(content).toContain('eventName')
    expect(content).toContain('ticketTypeName')
    expect(content).toContain('buyerName')
    expect(content).toContain('validatedAt')
  })
})
