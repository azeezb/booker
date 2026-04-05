import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/apiClient'
import { syncUser, getMe } from '../api/users'

export function useCurrentUser() {
  const { user, getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      const client = createApiClient(token)

      // Try to fetch existing user first
      try {
        return await getMe(client)
      } catch {
        // Not found — sync (create) then return
        const name = user?.nickname ?? user?.name ?? ''
        const email = user?.email ?? ''
        const synced = await syncUser(client, name, email)
        queryClient.setQueryData(['user', 'me'], synced)
        return synced
      }
    },
  })
}
