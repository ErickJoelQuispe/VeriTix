import type {
  BackofficeArtistPayload,
  BackofficeArtistRecord,
  BackofficeCreateUserPayload,
  BackofficeEventDetail,
  BackofficeEventPayload,
  BackofficeUpdateUserPayload,
  BackofficeUserRecord,
} from '~~/shared/types'
import {
  areStringArraysEqual,
  normalizeOptionalIsoDateTime,
  normalizeOptionalString,
  normalizeRequiredIsoDateTime,
  normalizeRequiredString,
  normalizeStringArray,
} from './formNormalizers'

export function normalizeEventPayload(payload: BackofficeEventPayload): BackofficeEventPayload {
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

function toEventComparablePayload(event: BackofficeEventDetail): BackofficeEventPayload {
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

export function hasEventSemanticChanges(event: BackofficeEventDetail, payload: BackofficeEventPayload): boolean {
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

export function normalizeArtistPayload(payload: BackofficeArtistPayload): BackofficeArtistPayload {
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

function toArtistComparablePayload(artist: BackofficeArtistRecord): BackofficeArtistPayload {
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

export function hasArtistSemanticChanges(artist: BackofficeArtistRecord, payload: BackofficeArtistPayload): boolean {
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

export function normalizeCreateUserPayload(payload: BackofficeCreateUserPayload): BackofficeCreateUserPayload {
  return {
    email: normalizeRequiredString(payload.email),
    phone: normalizeRequiredString(payload.phone),
    name: normalizeRequiredString(payload.name),
    lastName: normalizeRequiredString(payload.lastName),
    password: payload.password,
    role: payload.role,
  }
}

export function normalizeUpdateUserPayload(payload: BackofficeUpdateUserPayload): BackofficeUpdateUserPayload {
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

function toUserComparablePayload(user: BackofficeUserRecord): BackofficeUpdateUserPayload {
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

export function hasUserSemanticChanges(user: BackofficeUserRecord, payload: BackofficeUpdateUserPayload): boolean {
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
