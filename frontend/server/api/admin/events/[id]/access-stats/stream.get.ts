import { getHeader, getQuery, sendStream, setResponseHeader, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const { id } = event.context.params as { id: string }
  const { token } = getQuery(event)

  const backendUrl = `${config.backendApiBase}/events/${id}/access-stats/stream?token=${encodeURIComponent(String(token ?? ''))}`

  const headers = new Headers()
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) {
    headers.set('authorization', authHeader)
  }
  const cookieHeader = getHeader(event, 'cookie')
  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }
  headers.set('accept', 'text/event-stream')
  headers.set('cache-control', 'no-cache')

  const response = await fetch(backendUrl, { headers })

  setResponseStatus(event, response.status)
  setResponseHeader(event, 'content-type', 'text/event-stream')
  setResponseHeader(event, 'cache-control', 'no-cache')
  setResponseHeader(event, 'connection', 'keep-alive')
  setResponseHeader(event, 'x-accel-buffering', 'no')

  return sendStream(event, response.body!)
})
