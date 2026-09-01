import axios, { type AxiosInstance } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5240/api'

const clientCache = new Map<string, AxiosInstance>()

export function createApiClient(token: string): AxiosInstance {
  if (clientCache.has(token)) return clientCache.get(token)!

  const client = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
      return Promise.reject(error)
    },
  )

  clientCache.set(token, client)
  return client
}

export const publicApiClient = axios.create({ baseURL: BASE_URL })
