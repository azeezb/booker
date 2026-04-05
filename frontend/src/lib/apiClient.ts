import axios from 'axios'

const BASE_URL = 'http://localhost:5240/api'

export function createApiClient(token: string) {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const publicApiClient = axios.create({ baseURL: BASE_URL })
