import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath))
      continue
    }

    if (entry.isFile() && fullPath.endsWith('.vue')) {
      files.push(fullPath)
    }
  }

  return files
}

function hasBoundaryViolation(filePath: string, content: string) {
  return /<U[A-Z][A-Za-z0-9-]*/.test(content)
}

describe('nuxt ui boundary', () => {
  it('keeps direct Nuxt UI tags out of app code', async () => {
    const vueFiles = await walkFiles(appDir)

    const violations: string[] = []

    for (const filePath of vueFiles) {
      const content = await readFile(filePath, 'utf-8')

      if (hasBoundaryViolation(filePath, content)) {
        violations.push(relative(appDir, filePath))
      }
    }

    expect(violations, `Direct Nuxt UI usage found outside adapters:\n${violations.join('\n')}`).toEqual([])
  })
})
