import type { AxiosInstance } from 'axios'
import type { User } from '../types'

export const getMe = (client: AxiosInstance) =>
  client.get<User>('/user').then(r => r.data)

export const syncUser = (client: AxiosInstance, name: string, email: string) =>
  client.post<User>('/user', { name, email }).then(r => r.data)

export const updateUser = (client: AxiosInstance, name: string) =>
  client.patch<User>('/user', { name }).then(r => r.data)

export interface NextMeeting {
  id: string
  scheduledDate: string
  notes: string | null
  club: { id: string; name: string }
  book: {
    id: string
    googleBookId: string
    title: string
    author: string
    coverUrl: string | null
    pages: number | null
  } | null
}

export const getNextMeeting = (client: AxiosInstance) =>
  client.get<NextMeeting>('/user/next-meeting').then(r => r.data)
