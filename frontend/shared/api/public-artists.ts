export interface PublicArtistListApiItem {
  id: string
  name: string
  bio: string | null
  imageUrl: string | null
  country: string | null
  website: string | null
  isActive: boolean
  genres: Array<{
    id: string
    name: string
    slug: string
  }>
}

export interface PublicArtistDetailApiItem {
  id: string
  name: string
  slug: string
  bio: string | null
  imageUrl: string | null
  country: string | null
  website: string | null
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
  genres: Array<{
    id: string
    name: string
    slug: string
  }>
}
