import type { MaybeRef } from 'vue'
import type { PublicVenueDetailApiItem } from '~~/shared/api/public-venues'
import { usePublicVenuesRepository } from '../../repositories/publicVenuesRepository'

export function usePublicVenue(id: MaybeRef<string>) {
  const { getVenue } = usePublicVenuesRepository()

  const venueId = computed(() => unref(id).trim())

  return useAsyncData<PublicVenueDetailApiItem>(
    () => `veritix-public-venue:${venueId.value}`,
    async () => getVenue(venueId.value),
    {
      watch: [venueId],
      server: true,
    },
  )
}
