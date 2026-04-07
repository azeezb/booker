import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient, publicApiClient } from '../lib/apiClient'
import {
  getPublicClubs, getMyClubs, getClub, createClub, joinClub,
  updateFrequency, getClubMembers, getClubMeetings, createMeeting, updateMeeting,
} from '../api/clubs'

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

export function useClub(clubId: string) {
  const { getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: ['clubs', clubId],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return getClub(createApiClient(token), clubId)
    },
    enabled: !!clubId,
  })
}

export function useClubMembers(clubId: string) {
  const { getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: ['clubs', clubId, 'members'],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return getClubMembers(createApiClient(token), clubId)
    },
    enabled: !!clubId,
  })
}

export function useClubMeetings(clubId: string) {
  const { getAccessTokenSilently } = useAuth0()
  return useQuery({
    queryKey: ['clubs', clubId, 'meetings'],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      return getClubMeetings(createApiClient(token), clubId)
    },
    enabled: !!clubId,
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

export function useUpdateFrequency(clubId: string) {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (frequency: 'Fortnightly' | 'Monthly' | null) => {
      const token = await getAccessTokenSilently()
      return updateFrequency(createApiClient(token), clubId, frequency)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs', clubId] }),
  })
}

export function useCreateMeeting(clubId: string) {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { scheduledDate: string; notes?: string }) => {
      const token = await getAccessTokenSilently()
      return createMeeting(createApiClient(token), clubId, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs', clubId, 'meetings'] }),
  })
}

export function useUpdateMeeting(clubId: string) {
  const { getAccessTokenSilently } = useAuth0()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ meetingId, ...data }: { meetingId: string; scheduledDate?: string; bookId?: string; notes?: string }) => {
      const token = await getAccessTokenSilently()
      return updateMeeting(createApiClient(token), clubId, meetingId, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs', clubId, 'meetings'] }),
  })
}
