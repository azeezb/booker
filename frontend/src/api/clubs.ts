import type { AxiosInstance } from 'axios'
import type { Club } from '../types'

export const getPublicClubs = (client: AxiosInstance) =>
  client.get<Club[]>('/club').then(r => r.data)

export const getMyClubs = (client: AxiosInstance) =>
  client.get<Club[]>('/user/club').then(r => r.data)

export const createClub = (client: AxiosInstance, data: { name: string; description: string; isPublic: boolean }) =>
  client.post<Club>('/club', data).then(r => r.data)

export const joinClub = (client: AxiosInstance, clubId: string) =>
  client.post(`/club/${clubId}/join`).then(r => r.data)
