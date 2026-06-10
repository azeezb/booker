import type { AxiosInstance } from 'axios'

export interface BookSearchResult {
  googleBookId: string
  title: string
  author: string
  coverUrl: string | null
  isbn: string | null
  pages: number | null
}

export interface Book {
  id: string
  googleBookId: string
  isbn: string | null
  title: string
  author: string
  pages: number | null
  coverUrl: string | null
}

export const searchBooks = (client: AxiosInstance, query: string) =>
  client.get<BookSearchResult[]>('/book/search', { params: { q: query } }).then(r => r.data)

export const upsertBook = (client: AxiosInstance, data: Omit<BookSearchResult, 'isbn' | 'pages'> & { isbn?: string | null; pages?: number | null }) =>
  client.post<Book>('/book', data).then(r => r.data)
