import type { MaybeRef } from 'vue'
import type { PublicArtistDetailApiItem } from '~~/shared/api/public-artists'
import { usePublicArtistsRepository } from '../../repositories/publicArtistsRepository'

export function usePublicArtist(id: MaybeRef<string>) {
  const { getArtist } = usePublicArtistsRepository()

  const artistId = computed(() => unref(id).trim())

  return useAsyncData<PublicArtistDetailApiItem>(
    () => `veritix-public-artist:${artistId.value}`,
    async () => getArtist(artistId.value),
    {
      watch: [artistId],
      server: true,
    },
  )
}
