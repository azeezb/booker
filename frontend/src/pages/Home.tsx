import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, BookOpen, Users, Check, ShoppingBag, ExternalLink } from 'lucide-react'
import BookCover from '../components/BookCover'
import { useCurrentUser } from '../hooks/useUser'
import { useNextMeeting } from '../hooks/useUser'
import { useReadingStatus, useUpdateReadingStatus } from '../hooks/useReadingStatus'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow!'
  return `In ${days} days`
}

function readingHours(pages: number) {
  const hours = Math.round(pages / 60)
  return hours < 1 ? 'Under an hour' : `~${hours} hr${hours === 1 ? '' : 's'} to read`
}

function useBookDescription(googleBookId: string | undefined) {
  return useQuery({
    queryKey: ['google-book', googleBookId],
    queryFn: async () => {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`)
      const data = await res.json()
      const raw: string = data?.volumeInfo?.description ?? ''
      return raw.replace(/<[^>]*>/g, '').trim()
    },
    enabled: !!googleBookId,
    staleTime: Infinity,
  })
}

function buildRetailerLinks(title: string, author: string, isbn: string | null | undefined) {
  const q = isbn ?? encodeURIComponent(`${title} ${author}`)
  return [
    {
      name: 'Dymocks',
      url: `https://www.dymocks.com.au/search?q=${q}`,
    },
    {
      name: 'QBD',
      url: `https://www.qbd.com.au/search/?q=${q}`,
    },
    {
      name: 'Collins Booksellers',
      url: `https://www.collinsbooksellers.com.au/search?q=${q}`,
    },
    {
      name: 'Amazon AU',
      url: `https://www.amazon.com.au/s?k=${q}`,
    },
  ]
}

interface ReadingStatusBubbleProps {
  clubId: string
  meetingId: string
}

function ReadingStatusBubble({ clubId, meetingId }: ReadingStatusBubbleProps) {
  const { data: status } = useReadingStatus(clubId, meetingId)
  const { mutate: updateStatus, isPending } = useUpdateReadingStatus(clubId, meetingId)

  const hasBook = status?.hasBook ?? false
  const hasStarted = status?.hasStarted ?? false

  function toggle(field: 'hasBook' | 'hasStarted') {
    if (isPending) return
    if (field === 'hasBook') {
      // Unticking "got book" also unticks "started"
      updateStatus({ hasBook: !hasBook, hasStarted: !hasBook ? hasStarted : false })
    } else {
      // Ticking "started" also ticks "got book"
      updateStatus({ hasBook: hasStarted ? hasBook : true, hasStarted: !hasStarted })
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-5 space-y-4 text-left">
      <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400">Reading</p>
      <button
        onClick={() => toggle('hasBook')}
        className="w-full flex items-center gap-3 group"
      >
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
            hasBook
              ? 'bg-stone-800 border-stone-800'
              : 'border-stone-300 group-hover:border-stone-400'
          }`}
        >
          {hasBook && <Check size={10} strokeWidth={3} className="text-white" />}
        </div>
        <span className={`font-sans text-xs text-left leading-tight ${hasBook ? 'text-stone-700' : 'text-stone-400'}`}>
          Got the book?
        </span>
      </button>
      <button
        onClick={() => toggle('hasStarted')}
        className="w-full flex items-center gap-3 group"
      >
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
            hasStarted
              ? 'bg-stone-800 border-stone-800'
              : 'border-stone-300 group-hover:border-stone-400'
          }`}
        >
          {hasStarted && <Check size={10} strokeWidth={3} className="text-white" />}
        </div>
        <span className={`font-sans text-xs text-left leading-tight ${hasStarted ? 'text-stone-700' : 'text-stone-400'}`}>
          Started reading?
        </span>
      </button>
    </div>
  )
}

interface FindBookBubbleProps {
  title: string
  author: string
  isbn: string | null | undefined
}

function FindBookBubble({ title, author, isbn }: FindBookBubbleProps) {
  const [open, setOpen] = useState(true)
  const links = buildRetailerLinks(title, author, isbn)

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-5 text-left">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full h-full flex flex-col items-start gap-2"
        >
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400">Procure</p>
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} strokeWidth={1.5} className="text-stone-400" />
            <span className="font-sans text-xs text-stone-500">Find this book</span>
          </div>
        </button>
      ) : (
        <div className="space-y-2">
          <p className="font-sans text-[10px] items-center tracking-[0.15em] uppercase text-stone-400">Buy from</p>
          {links.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center justify-between w-full group"
            >
              <span className="font-sans text-xs text-stone-600 group-hover:text-stone-900 transition-colors">
                {link.name}
              </span>
              <ExternalLink size={10} strokeWidth={1.5} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            </a>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="font-sans text-[10px] text-stone-300 hover:text-stone-400 transition-colors pt-1"
          >
            close
          </button>
        </div>
      )}
    </div>
  )
}

interface BubblesColumnProps {
  clubId: string
  meetingId: string
  book: { title: string; author: string; isbn: string | null | undefined }
}

function BubblesColumn({ clubId, meetingId, book }: BubblesColumnProps) {
  const { data: status } = useReadingStatus(clubId, meetingId)
  return (
    <div className="flex flex-col gap-3 w-44 flex-shrink-0 self-stretch">
      <ReadingStatusBubble clubId={clubId} meetingId={meetingId} />
      {!status?.hasBook && (
        <FindBookBubble title={book.title} author={book.author} isbn={book.isbn} />
      )}
    </div>
  )
}

export default function Home() {
  const { data: dbUser } = useCurrentUser()
  const { data: nextMeeting, isLoading } = useNextMeeting()
  const { data: description } = useBookDescription(nextMeeting?.book?.googleBookId)
  const navigate = useNavigate()

  const firstName = dbUser?.name?.split(' ')[0].toLowerCase()

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 text-center">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-400 mb-1 py-12">
        Welcome back, {firstName}!
      </p>

      {isLoading && (
        <div className="w-full max-w-sm h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !nextMeeting && (
        <div className="w-full max-w-sm bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-sm">
          <BookOpen size={32} strokeWidth={1} className="text-stone-300 mx-auto mb-3" />
          <p className="font-display text-xl font-light text-stone-400">No upcoming meetings</p>
          <button
            onClick={() => navigate('/clubs')}
            className="mt-4 text-xs font-sans text-stone-500 border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all"
          >
            Browse clubs
          </button>
        </div>
      )}

      {!isLoading && nextMeeting && (
        <div className="w-full max-w-lg flex gap-3 items-start">
          {/* Main meeting card */}
          <div
            className="flex-1 min-w-0 bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/clubs/${nextMeeting.club.id}`)}
          >
            {/* Book cover */}
            <div className="flex justify-center pt-8 pb-4 bg-gradient-to-b from-stone-50 to-transparent">
              <BookCover
                coverUrl={nextMeeting.book?.coverUrl}
                isbn={nextMeeting.book?.isbn}
                title={nextMeeting.book?.title ?? ''}
                className="w-28 shadow-xl rounded-lg"
                placeholderClassName="w-28 h-40 bg-stone-100 rounded-lg flex items-center justify-center"
                iconSize={28}
              />
            </div>

            <div className="px-6 pb-6 space-y-3">
              {nextMeeting.book ? (
                <>
                  <div>
                    <p className="font-display text-2xl font-light text-stone-800 leading-tight">
                      {nextMeeting.book.title}
                    </p>
                    <p className="font-sans text-sm text-stone-400 mt-0.5">
                      {nextMeeting.book.author}
                    </p>
                    {nextMeeting.book.pages && (
                      <p className="font-sans text-xs text-stone-300 mt-1">
                        {readingHours(nextMeeting.book.pages)}
                      </p>
                    )}
                  </div>

                  {description && (
                    <p className="font-sans text-xs text-stone-500 leading-relaxed line-clamp-4">
                      {description}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-sans text-sm text-stone-400 italic">No book selected yet</p>
              )}

              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Calendar size={12} strokeWidth={1.5} />
                    <span className="font-sans text-xs">{formatDate(nextMeeting.scheduledDate)}</span>
                  </div>
                  <span className="font-sans text-xs text-emerald-600 font-medium">
                    {daysUntil(nextMeeting.scheduledDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Users size={12} strokeWidth={1.5} />
                  <span className="font-sans text-xs">{nextMeeting.club.name}</span>
                </div>
              </div>
            </div>
          </div>

          {nextMeeting.book && (
            <BubblesColumn
              clubId={nextMeeting.club.id}
              meetingId={nextMeeting.id}
              book={nextMeeting.book}
            />
          )}
        </div>
      )}
    </div>
  )
}
