import type {
  AdminArtistPayload,
  AdminArtistRecord,
  AdminCreateUserPayload,
  AdminEventDetail,
  AdminEventPayload,
  AdminUpdateUserPayload,
  AdminUserRecord,
} from '~/types'

function normalizeRequiredString(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const normalized = normalizeRequiredString(value)

  return normalized || undefined
}

function normalizeOptionalIsoDateTime(value: string | null | undefined): string | undefined {
  const normalized = normalizeOptionalString(value)

  if (!normalized) {
    return undefined
  }

  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

function normalizeRequiredIsoDateTime(value: string | null | undefined): string {
  return normalizeOptionalIsoDateTime(value) ?? ''
}

function normalizeStringArray(values?: Array<string | null | undefined>): string[] | undefined {
  if (!values?.length) {
    return undefined
  }

  const normalizedValues = values
    .map(value => normalizeOptionalString(value))
    .filter((value): value is string => Boolean(value))

  if (!normalizedValues.length) {
    return undefined
  }

  return [...new Set(normalizedValues)].sort()
}

function areStringArraysEqual(left?: string[], right?: string[]): boolean {
  if (!left?.length && !right?.length) {
    return true
  }

  if (!left || !right || left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}

export function normalizeEventPayload(payload: AdminEventPayload): AdminEventPayload {
  return {
    name: normalizeRequiredString(payload.name),
    description: normalizeOptionalString(payload.description),
    eventDate: normalizeRequiredIsoDateTime(payload.eventDate),
    doorsOpenTime: normalizeOptionalIsoDateTime(payload.doorsOpenTime),
    startSale: normalizeOptionalIsoDateTime(payload.startSale),
    endSale: normalizeOptionalIsoDateTime(payload.endSale),
    maxCapacity: Number(payload.maxCapacity),
    venueId: normalizeRequiredString(payload.venueId),
    imageUrl: normalizeOptionalString(payload.imageUrl),
    currency: payload.currency,
    formatId: normalizeOptionalString(payload.formatId),
    genreIds: normalizeStringArray(payload.genreIds),
  }
}

function toEventComparablePayload(event: AdminEventDetail): AdminEventPayload {
  return normalizeEventPayload({
    name: event.name,
    description: event.description ?? undefined,
    eventDate: event.eventDate,
    doorsOpenTime: event.doorsOpenTime ?? undefined,
    startSale: event.startSale ?? undefined,
    endSale: event.endSale ?? undefined,
    maxCapacity: event.maxCapacity,
    venueId: event.venue.id,
    imageUrl: event.imageUrl ?? undefined,
    currency: event.currency,
    formatId: event.format?.id,
    genreIds: event.genres.map(genre => genre.id),
  })
}

export function hasEventSemanticChanges(event: AdminEventDetail, payload: AdminEventPayload): boolean {
  const normalizedPayload = normalizeEventPayload(payload)
  const comparableEvent = toEventComparablePayload(event)

  return (
    normalizedPayload.name !== comparableEvent.name
    || normalizedPayload.description !== comparableEvent.description
    || normalizedPayload.eventDate !== comparableEvent.eventDate
    || normalizedPayload.doorsOpenTime !== comparableEvent.doorsOpenTime
    || normalizedPayload.startSale !== comparableEvent.startSale
    || normalizedPayload.endSale !== comparableEvent.endSale
    || normalizedPayload.maxCapacity !== comparableEvent.maxCapacity
    || normalizedPayload.venueId !== comparableEvent.venueId
    || normalizedPayload.imageUrl !== comparableEvent.imageUrl
    || normalizedPayload.currency !== comparableEvent.currency
    || normalizedPayload.formatId !== comparableEvent.formatId
    || !areStringArraysEqual(normalizedPayload.genreIds, comparableEvent.genreIds)
  )
}

export function normalizeArtistPayload(payload: AdminArtistPayload): AdminArtistPayload {
  return {
    name: normalizeRequiredString(payload.name),
    slug: normalizeRequiredString(payload.slug),
    bio: normalizeOptionalString(payload.bio),
    imageUrl: normalizeOptionalString(payload.imageUrl),
    country: normalizeOptionalString(payload.country),
    website: normalizeOptionalString(payload.website),
    isActive: payload.isActive,
    genreIds: normalizeStringArray(payload.genreIds),
  }
}

function toArtistComparablePayload(artist: AdminArtistRecord): AdminArtistPayload {
  return normalizeArtistPayload({
    name: artist.name,
    slug: artist.slug,
    bio: artist.bio ?? undefined,
    imageUrl: artist.imageUrl ?? undefined,
    country: artist.country ?? undefined,
    website: artist.website ?? undefined,
    isActive: artist.isActive,
    genreIds: artist.genres.map(genre => genre.id),
  })
}

export function hasArtistSemanticChanges(artist: AdminArtistRecord, payload: AdminArtistPayload): boolean {
  const normalizedPayload = normalizeArtistPayload(payload)
  const comparableArtist = toArtistComparablePayload(artist)

  return (
    normalizedPayload.name !== comparableArtist.name
    || normalizedPayload.slug !== comparableArtist.slug
    || normalizedPayload.bio !== comparableArtist.bio
    || normalizedPayload.imageUrl !== comparableArtist.imageUrl
    || normalizedPayload.country !== comparableArtist.country
    || normalizedPayload.website !== comparableArtist.website
    || normalizedPayload.isActive !== comparableArtist.isActive
    || !areStringArraysEqual(normalizedPayload.genreIds, comparableArtist.genreIds)
  )
}

export function normalizeCreateUserPayload(payload: AdminCreateUserPayload): AdminCreateUserPayload {
  return {
    email: normalizeRequiredString(payload.email),
    phone: normalizeRequiredString(payload.phone),
    name: normalizeRequiredString(payload.name),
    lastName: normalizeRequiredString(payload.lastName),
    password: payload.password,
    role: payload.role,
  }
}

export function normalizeUpdateUserPayload(payload: AdminUpdateUserPayload): AdminUpdateUserPayload {
  return {
    email: normalizeOptionalString(payload.email),
    phone: normalizeOptionalString(payload.phone),
    name: normalizeOptionalString(payload.name),
    lastName: normalizeOptionalString(payload.lastName),
    avatarUrl: normalizeOptionalString(payload.avatarUrl),
    role: payload.role,
    isActive: payload.isActive,
    emailVerified: payload.emailVerified,
  }
}

function toUserComparablePayload(user: AdminUserRecord): AdminUpdateUserPayload {
  return normalizeUpdateUserPayload({
    email: user.email,
    phone: user.phone,
    name: user.name,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl ?? undefined,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
  })
}

export function hasUserSemanticChanges(user: AdminUserRecord, payload: AdminUpdateUserPayload): boolean {
  const normalizedPayload = normalizeUpdateUserPayload(payload)
  const comparableUser = toUserComparablePayload(user)

  return (
    normalizedPayload.email !== comparableUser.email
    || normalizedPayload.phone !== comparableUser.phone
    || normalizedPayload.name !== comparableUser.name
    || normalizedPayload.lastName !== comparableUser.lastName
    || normalizedPayload.avatarUrl !== comparableUser.avatarUrl
    || normalizedPayload.role !== comparableUser.role
    || normalizedPayload.isActive !== comparableUser.isActive
    || normalizedPayload.emailVerified !== comparableUser.emailVerified
  )
}
