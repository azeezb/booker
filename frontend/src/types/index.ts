export interface Club {
  id: string
  name: string
  description: string
  createdBy: string
  isPublic: boolean
  createdAt: string
  meetingFrequency: 'Fortnightly' | 'Monthly' | null
}

export interface User {
  id: string
  name: string
  email: string
  auth0Id: string
  createdAt: string
}

export interface ClubMember {
  id: string
  role: 'owner' | 'member'
  joinedAt: string
  user: { id: string; name: string }
}

export interface MeetingBook {
  id: string
  title: string
  author: string
  coverUrl: string
}

export interface Meeting {
  id: string
  scheduledDate: string
  notes: string | null
  createdAt: string
  book: MeetingBook | null
  addedBy: { id: string; name: string }
}
