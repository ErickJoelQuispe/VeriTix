import { Buffer } from 'node:buffer'
import { createError, getHeader, getRouterParam, send, setResponseHeader } from 'h3'

function buildPdfRequestHeaders(event: Parameters<typeof getHeader>[0]): Headers {
  const headers = new Headers()

  const authHeader = getHeader(event, 'authorization')
  const cookieHeader = getHeader(event, 'cookie')

  if (authHeader) {
    headers.set('authorization', authHeader)
  }

  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }

  return headers
}

function normalizePdfDownloadError(error: unknown): never {
  throw createError({
    statusCode: (error as { response?: { status?: number } })?.response?.status ?? 500,
    statusMessage: 'No se pudo generar el PDF.',
  })
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador de la entrada.' })
  }

  const config = useRuntimeConfig(event)
  const response = await $fetch.raw<ArrayBuffer>(`/tickets/${id}/pdf`, {
    baseURL: config.backendApiBase,
    method: 'GET',
    headers: buildPdfRequestHeaders(event),
    responseType: 'arrayBuffer',
  }).catch(normalizePdfDownloadError)

  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="ticket-${id}.pdf"`)

  return send(event, Buffer.from(response._data as ArrayBuffer), 'application/pdf')
})
