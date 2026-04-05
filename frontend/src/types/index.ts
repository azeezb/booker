export interface Club {
  id: string
  name: string
  description: string
  createdBy: string
  isPublic: boolean
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  auth0Id: string
  createdAt: string
}
