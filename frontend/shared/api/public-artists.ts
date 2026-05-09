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
