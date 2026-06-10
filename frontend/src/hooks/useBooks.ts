import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/apiClient'
import { searchBooks, upsertBook } from '../api/books'
import type { BookSearchResult } from '../api/books'

export function useBookSearch(query: string) {
  const { getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: ['books', 'search', query],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return searchBooks(createApiClient(token), query)
    },
    enabled: query.length >= 2,
    staleTime: 60_000,
  })
}

export function useUpsertBook() {
  const { getAccessTokenSilently } = useAuth0()
  return useMutation({
    mutationFn: async (data: BookSearchResult) => {
      const token = await getAccessTokenSilently()
      return upsertBook(createApiClient(token), data)
    },
  })
}
