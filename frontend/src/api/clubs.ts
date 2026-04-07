import type { AxiosInstance } from 'axios'
import type { Club, ClubMember, Meeting } from '../types'

export const getPublicClubs = (client: AxiosInstance) =>
  client.get<Club[]>('/club').then(r => r.data)

export const getMyClubs = (client: AxiosInstance) =>
  client.get<Club[]>('/user/club').then(r => r.data)

export const getClub = (client: AxiosInstance, clubId: string) =>
  client.get<Club>(`/club/${clubId}`).then(r => r.data)

export const createClub = (client: AxiosInstance, data: { name: string; description: string; isPublic: boolean }) =>
  client.post<Club>('/club', data).then(r => r.data)

export const joinClub = (client: AxiosInstance, clubId: string) =>
  client.post(`/club/${clubId}/join`).then(r => r.data)

export const updateFrequency = (client: AxiosInstance, clubId: string, frequency: 'Fortnightly' | 'Monthly' | null) =>
  client.patch<Club>(`/club/${clubId}/frequency`, { frequency }).then(r => r.data)

export const getClubMembers = (client: AxiosInstance, clubId: string) =>
  client.get<ClubMember[]>(`/club/${clubId}/member`).then(r => r.data)

export const getClubMeetings = (client: AxiosInstance, clubId: string) =>
  client.get<Meeting[]>(`/club/${clubId}/meeting`).then(r => r.data)

export const createMeeting = (client: AxiosInstance, clubId: string, data: { scheduledDate: string; notes?: string }) =>
  client.post<Meeting>(`/club/${clubId}/meeting`, data).then(r => r.data)

export const updateMeeting = (
  client: AxiosInstance,
  clubId: string,
  meetingId: string,
  data: { scheduledDate?: string; bookId?: string; notes?: string }
) => client.patch<Meeting>(`/club/${clubId}/meeting/${meetingId}`, data).then(r => r.data)
