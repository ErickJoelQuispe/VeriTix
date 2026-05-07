export function useEventSearch() {
  const query = useState<string>('veritix-search-query', () => '')

  const filters = computed(() => {
    return {
      search: query.value,
    }
  })

  const { data, pending } = usePublicEvents(filters)

  const results = computed(() => {
    return data.value?.data ?? []
  })

  return {
    query,
    results,
    pending,
  }
}
