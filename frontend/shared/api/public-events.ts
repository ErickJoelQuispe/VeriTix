export interface PublicEventListApiItem {
  id: string
  name: string
  eventDate: string | Date
  imageUrl: string | null
  currency: string
  venue: {
    id: string
    name: string
    city: string
  }
  format: {
    id: string
    name: string
  } | null
}

export interface PublicEventDetailApiItem {
  id: string
  name: string
  description: string | null
  eventDate: string | Date
  doorsOpenTime: string | Date | null
  startSale: string | Date | null
  endSale: string | Date | null
  maxCapacity: number
  imageUrl: string | null
  currency: string
  creatorId: string
  venue: {
    id: string
    name: string
    slug: string
    address: string
    city: string
    state: string | null
    country: string
    capacity: number | null
    type: string
    imageUrl: string | null
  }
  format: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
  } | null
  genres: Array<{
    id: string
    name: string
    slug: string
  }>
}
