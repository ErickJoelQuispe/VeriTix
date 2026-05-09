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
