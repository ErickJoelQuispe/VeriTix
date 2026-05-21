import type {
  BackofficeArtistPayload,
  BackofficeArtistRecord,
  BackofficeConcertFormatPayload,
  BackofficeFormatRecord,
  BackofficeCreateUserPayload,
  BackofficeEventDetail,
  BackofficeEventPayload,
  BackofficeGenrePayload,
  BackofficeGenreRecord,
  BackofficeUpdateUserPayload,
  BackofficeUserRecord,
  BackofficeVenuePayload,
  BackofficeVenueRecord,
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
  const comparableEvent = toEventComparablePayload(event)

  return (
    payload.name !== comparableEvent.name
    || payload.description !== comparableEvent.description
    || payload.eventDate !== comparableEvent.eventDate
    || payload.doorsOpenTime !== comparableEvent.doorsOpenTime
    || payload.startSale !== comparableEvent.startSale
    || payload.endSale !== comparableEvent.endSale
    || payload.maxCapacity !== comparableEvent.maxCapacity
    || payload.venueId !== comparableEvent.venueId
    || payload.imageUrl !== comparableEvent.imageUrl
    || payload.currency !== comparableEvent.currency
    || payload.formatId !== comparableEvent.formatId
    || !areStringArraysEqual(payload.genreIds, comparableEvent.genreIds)
  )
}

export function normalizeArtistPayload(payload: BackofficeArtistPayload): BackofficeArtistPayload {
  return {
    name: normalizeRequiredString(payload.name),
    ...(payload.slug !== undefined && { slug: normalizeOptionalString(payload.slug) }),
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
    bio: artist.bio ?? undefined,
    imageUrl: artist.imageUrl ?? undefined,
    country: artist.country ?? undefined,
    website: artist.website ?? undefined,
    isActive: artist.isActive,
    genreIds: artist.genres.map(genre => genre.id),
  })
}

export function hasArtistSemanticChanges(artist: BackofficeArtistRecord, payload: BackofficeArtistPayload): boolean {
  const comparableArtist = toArtistComparablePayload(artist)

  return (
    payload.name !== comparableArtist.name
    || payload.bio !== comparableArtist.bio
    || payload.imageUrl !== comparableArtist.imageUrl
    || payload.country !== comparableArtist.country
    || payload.website !== comparableArtist.website
    || payload.isActive !== comparableArtist.isActive
    || !areStringArraysEqual(payload.genreIds, comparableArtist.genreIds)
  )
}

export function normalizeGenrePayload(payload: BackofficeGenrePayload): BackofficeGenrePayload {
  return {
    name: normalizeRequiredString(payload.name),
    ...(payload.slug !== undefined && { slug: normalizeOptionalString(payload.slug) }),
    description: normalizeOptionalString(payload.description),
  }
}

function toGenreComparablePayload(genre: BackofficeGenreRecord): BackofficeGenrePayload {
  return normalizeGenrePayload({
    name: genre.name,
    description: genre.description ?? undefined,
  })
}

export function hasGenreSemanticChanges(genre: BackofficeGenreRecord, payload: BackofficeGenrePayload): boolean {
  const comparableGenre = toGenreComparablePayload(genre)

  return payload.name !== comparableGenre.name
    || payload.description !== comparableGenre.description
}

export function normalizeConcertFormatPayload(payload: BackofficeConcertFormatPayload): BackofficeConcertFormatPayload {
  return {
    name: normalizeRequiredString(payload.name),
    ...(payload.slug !== undefined && { slug: normalizeOptionalString(payload.slug) }),
    description: normalizeOptionalString(payload.description),
    icon: normalizeOptionalString(payload.icon),
  }
}

function toConcertFormatComparablePayload(format: BackofficeFormatRecord): BackofficeConcertFormatPayload {
  return normalizeConcertFormatPayload({
    name: format.name,
    description: format.description ?? undefined,
    icon: format.icon ?? undefined,
  })
}

export function hasConcertFormatSemanticChanges(format: BackofficeFormatRecord, payload: BackofficeConcertFormatPayload): boolean {
  const comparableFormat = toConcertFormatComparablePayload(format)

  return payload.name !== comparableFormat.name
    || payload.description !== comparableFormat.description
    || payload.icon !== comparableFormat.icon
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
  const comparableUser = toUserComparablePayload(user)

  return (
    payload.email !== comparableUser.email
    || payload.phone !== comparableUser.phone
    || payload.name !== comparableUser.name
    || payload.lastName !== comparableUser.lastName
    || payload.avatarUrl !== comparableUser.avatarUrl
    || payload.role !== comparableUser.role
    || payload.isActive !== comparableUser.isActive
    || payload.emailVerified !== comparableUser.emailVerified
  )
}

export function normalizeVenuePayload(payload: BackofficeVenuePayload): BackofficeVenuePayload {
  return {
    name: normalizeRequiredString(payload.name),
    ...(payload.slug !== undefined && { slug: normalizeOptionalString(payload.slug) }),
    address: normalizeRequiredString(payload.address),
    city: normalizeRequiredString(payload.city),
    state: payload.state === '' ? null : (payload.state ?? undefined),
    country: normalizeOptionalString(payload.country) || 'ES',
    capacity: payload.capacity != null ? Number(payload.capacity) : null,
    type: payload.type,
    isActive: payload.isActive,
    imageUrl: payload.imageUrl === '' ? null : (payload.imageUrl ?? undefined),
    website: payload.website === '' ? null : (payload.website ?? undefined),
  }
}

function toVenueComparablePayload(venue: BackofficeVenueRecord): BackofficeVenuePayload {
  return normalizeVenuePayload({
    name: venue.name,
    address: venue.address,
    city: venue.city,
    state: venue.state,
    country: venue.country,
    capacity: venue.capacity,
    type: venue.type,
    isActive: venue.isActive,
    imageUrl: venue.imageUrl,
    website: venue.website,
  })
}

export function hasVenueSemanticChanges(venue: BackofficeVenueRecord, payload: BackofficeVenuePayload): boolean {
  const comparableVenue = toVenueComparablePayload(venue)

  return (
    payload.name !== comparableVenue.name
    || payload.address !== comparableVenue.address
    || payload.city !== comparableVenue.city
    || payload.state !== comparableVenue.state
    || payload.country !== comparableVenue.country
    || payload.capacity !== comparableVenue.capacity
    || payload.type !== comparableVenue.type
    || payload.isActive !== comparableVenue.isActive
    || payload.imageUrl !== comparableVenue.imageUrl
    || payload.website !== comparableVenue.website
  )
}
