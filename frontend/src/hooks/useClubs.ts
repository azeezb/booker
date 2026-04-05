import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient, publicApiClient } from '../lib/apiClient'
import { getPublicClubs, getMyClubs, createClub, joinClub } from '../api/clubs'

export function usePublicClubs() {
  return useQuery({
    queryKey: ['clubs', 'public'],
    queryFn: () => getPublicClubs(publicApiClient),
  })
}

export function useMyClubs() {
  const { getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: ['clubs', 'my'],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return getMyClubs(createApiClient(token))
    },
  })
}

export function useCreateClub() {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description: string; isPublic: boolean }) => {
      const token = await getAccessTokenSilently()
      return createClub(createApiClient(token), data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs'] }),
  })
}

export function useJoinClub() {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clubId: string) => {
      const token = await getAccessTokenSilently()
      return joinClub(createApiClient(token), clubId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs'] }),
  })
}
