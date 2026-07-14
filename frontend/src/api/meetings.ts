import type { AxiosInstance } from 'axios'

export interface ReadingStatus {
  hasBook: boolean
  hasStarted: boolean
}

export const getReadingStatus = (client: AxiosInstance, clubId: string, meetingId: string) =>
  client.get<ReadingStatus>(`/club/${clubId}/meeting/${meetingId}/reading-status`).then(r => r.data)

export const updateReadingStatus = (
  client: AxiosInstance,
  clubId: string,
  meetingId: string,
  hasBook: boolean,
  hasStarted: boolean,
) =>
  client
    .patch<ReadingStatus>(`/club/${clubId}/meeting/${meetingId}/reading-status`, { hasBook, hasStarted })
    .then(r => r.data)
