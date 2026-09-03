import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/apiClient'
import { syncUser, getNextMeeting, deleteUser } from '../api/users'

export function useCurrentUser() {
  const { user, getAccessTokenSilently } = useAuth0()

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      const client = createApiClient(token)

      // Upsert on every fetch so Email/Name stay in sync with Auth0
      const name = user?.nickname ?? user?.name ?? ''
      const email = user?.email ?? ''
      return await syncUser(client, name, email)
    },
    enabled: !!user,
  })
}

export function useNextMeeting() {
  const { getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: ['user', 'next-meeting'],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      try {
        return await getNextMeeting(createApiClient(token))
      } catch {
        return null
      }
    },
  })
}

export function useDeleteUser() {
  const { getAccessTokenSilently, logout } = useAuth0()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const token = await getAccessTokenSilently()
      return deleteUser(createApiClient(token))
    },
    onSuccess: () => {
      queryClient.clear()
      logout({ logoutParams: { returnTo: window.location.origin } })
    },
  })
}
