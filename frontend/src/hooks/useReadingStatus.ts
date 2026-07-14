import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/apiClient'
import { getReadingStatus, updateReadingStatus } from '../api/meetings'

export function useReadingStatus(clubId: string, meetingId: string) {
  const { getAccessTokenSilently } = useAuth0()

  return useQuery({
    queryKey: ['reading-status', meetingId],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return getReadingStatus(createApiClient(token), clubId, meetingId)
    },
    enabled: !!clubId && !!meetingId,
  })
}

export function useUpdateReadingStatus(clubId: string, meetingId: string) {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ hasBook, hasStarted }: { hasBook: boolean; hasStarted: boolean }) => {
      const token = await getAccessTokenSilently()
      return updateReadingStatus(createApiClient(token), clubId, meetingId, hasBook, hasStarted)
    },
    onSuccess: data => {
      queryClient.setQueryData(['reading-status', meetingId], data)
    },
  })
}
