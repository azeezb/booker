import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, BookOpen, Users } from 'lucide-react'
import { useCurrentUser } from '../hooks/useUser'
import { useNextMeeting } from '../hooks/useUser'

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
      // Strip HTML tags Google Books sometimes includes
      return raw.replace(/<[^>]*>/g, '').trim()
    },
    enabled: !!googleBookId,
    staleTime: Infinity,
  })
}

export default function Home() {
  const { data: dbUser } = useCurrentUser()
  const { data: nextMeeting, isLoading } = useNextMeeting()
  const { data: description } = useBookDescription(nextMeeting?.book?.googleBookId)
  const navigate = useNavigate()

  const firstName = dbUser?.name?.split(' ')[0].toLowerCase();

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 text-center">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-400 mb-1 py-12">
        Welcome back, {firstName}!
      </p>
      {/* <h1 className="font-display text-4xl font-light text-stone-800 mb-8">
        {firstName}
      </h1> */}

      {isLoading && (
        <div className="w-full max-w-sm h-64 bg-white/40 rounded-3xl animate-pulse" />
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
        <div
          className="w-full max-w-sm bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/clubs/${nextMeeting.club.id}`)}
        >
          {/* Book cover */}
          {nextMeeting.book?.coverUrl ? (
            <div className="flex justify-center pt-8 pb-4 bg-gradient-to-b from-stone-50 to-transparent">
              <img
                src={nextMeeting.book.coverUrl}
                alt={nextMeeting.book.title}
                className="w-28 shadow-xl rounded-lg"
              />
            </div>
          ) : (
            <div className="flex justify-center pt-8 pb-4">
              <div className="w-28 h-40 bg-stone-100 rounded-lg flex items-center justify-center">
                <BookOpen size={28} strokeWidth={1} className="text-stone-300" />
              </div>
            </div>
          )}

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
      )}
    </div>
  )
}
