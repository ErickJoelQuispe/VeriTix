export interface PublicVenueListApiItem {
  id: string
  name: string
  address: string
  city: string
  state: string | null
  country: string
  capacity: number | null
  type: string
  imageUrl: string | null
  website: string | null
  isActive: boolean
}

export interface PublicVenueDetailApiItem {
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
  website: string | null
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}
