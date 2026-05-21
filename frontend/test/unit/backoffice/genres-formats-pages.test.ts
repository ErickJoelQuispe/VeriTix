import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const appDir = join(process.cwd(), 'app')

describe('genres and concert formats backoffice pages', () => {
  it('wires the genres flow end to end', async () => {
    const indexPage = await readFile(join(appDir, 'pages/backoffice/genres/index.vue'), 'utf-8')
    const newPage = await readFile(join(appDir, 'pages/backoffice/genres/new.vue'), 'utf-8')
    const editPage = await readFile(join(appDir, 'pages/backoffice/genres/[id]/edit.vue'), 'utf-8')
    const form = await readFile(join(appDir, 'components/pages/backoffice/GenreForm.vue'), 'utf-8')

    expect(indexPage).toContain('useBackofficeGenresRepository')
    expect(indexPage).toContain("/backoffice/genres/new")
    expect(indexPage).toContain('PagesBackofficeDeleteAction')
    expect(newPage).toContain('createGenre')
    expect(newPage).toContain("/backoffice/genres")
    expect(editPage).toContain('getGenre')
    expect(editPage).toContain('hasGenreSemanticChanges')
    expect(editPage).toContain('updateGenre')
    expect(form).toContain('normalizeGenrePayload')
    expect(form).toContain('slug')
    expect(form).toContain('description')
  })

  it('wires the concert formats flow end to end', async () => {
    const indexPage = await readFile(join(appDir, 'pages/backoffice/concert-formats/index.vue'), 'utf-8')
    const newPage = await readFile(join(appDir, 'pages/backoffice/concert-formats/new.vue'), 'utf-8')
    const editPage = await readFile(join(appDir, 'pages/backoffice/concert-formats/[id]/edit.vue'), 'utf-8')
    const form = await readFile(join(appDir, 'components/pages/backoffice/ConcertFormatForm.vue'), 'utf-8')

    expect(indexPage).toContain('useBackofficeConcertFormatsRepository')
    expect(indexPage).toContain("/backoffice/concert-formats/new")
    expect(indexPage).toContain('PagesBackofficeDeleteAction')
    expect(newPage).toContain('createConcertFormat')
    expect(newPage).toContain("/backoffice/concert-formats")
    expect(editPage).toContain('getConcertFormat')
    expect(editPage).toContain('hasConcertFormatSemanticChanges')
    expect(editPage).toContain('updateConcertFormat')
    expect(form).toContain('normalizeConcertFormatPayload')
    expect(form).toContain('slug')
    expect(form).toContain('icon')
  })
})
