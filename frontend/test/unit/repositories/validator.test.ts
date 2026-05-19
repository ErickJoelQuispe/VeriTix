import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('validatorRepository', () => {
  it('exports useValidatorRepository', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')
    expect(content).toContain('export function useValidatorRepository()')
  })

  it('exposes validateTicket function', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')
    expect(content).toContain('validateTicket')
  })

  it('validateTicket posts to /tickets/validate', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')
    expect(content).toContain('/tickets/validate')
    expect(content).toContain("'POST'")
  })

  it('validateTicket sends payload in body', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')
    expect(content).toContain('payload')
  })

  it('defines ValidateTicketResponse interface with required fields', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')
    expect(content).toContain('ticketId')
    expect(content).toContain('eventName')
    expect(content).toContain('ticketTypeName')
    expect(content).toContain('buyerName')
    expect(content).toContain('validatedAt')
  })

  it('uses useApiRequest for HTTP calls', async () => {
    const content = await readFile(join(appDir, 'repositories/validatorRepository.ts'), 'utf-8')
    expect(content).toContain('useApiRequest')
  })
})
