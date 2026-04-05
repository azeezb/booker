import type { AxiosInstance } from 'axios'
import type { User } from '../types'

export const getMe = (client: AxiosInstance) =>
  client.get<User>('/user').then(r => r.data)

export const syncUser = (client: AxiosInstance, name: string, email: string) =>
  client.post<User>('/user', { name, email }).then(r => r.data)

export const updateUser = (client: AxiosInstance, name: string) =>
  client.patch<User>('/user', { name }).then(r => r.data)
