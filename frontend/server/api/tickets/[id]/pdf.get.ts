import { createError, getRouterParam, send, setResponseHeader } from 'h3'
import { getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador de la entrada.' })
  }

  const config = useRuntimeConfig(event)

  const headers = new Headers()
  const authHeader = getHeader(event, 'authorization')
  const cookieHeader = getHeader(event, 'cookie')
  if (authHeader) headers.set('authorization', authHeader)
  if (cookieHeader) headers.set('cookie', cookieHeader)

  const response = await $fetch.raw<ArrayBuffer>(`/tickets/${id}/pdf`, {
    baseURL: config.backendApiBase,
    method: 'GET',
    headers,
    responseType: 'arrayBuffer',
  }).catch((error) => {
    throw createError({
      statusCode: error?.response?.status ?? 500,
      statusMessage: 'No se pudo generar el PDF.',
    })
  })

  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="ticket-${id}.pdf"`)

  return send(event, Buffer.from(response._data as ArrayBuffer), 'application/pdf')
})
