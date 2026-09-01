import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { ArrowLeft, BookOpen, Users } from 'lucide-react'
import { usePublicClub } from '../hooks/useClubs'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BrowseClubDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loginWithRedirect } = useAuth0()
  const { data: club, isLoading } = usePublicClub(id!)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <p className="font-sans text-sm text-stone-400">Club not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 px-5 pt-12 pb-20">
      <div className="max-w-lg mx-auto space-y-8">
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 font-sans text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Public clubs
        </button>

        <div>
          <h1 className="font-display text-3xl font-light text-stone-800">{club.name}</h1>
          {club.description && (
            <p className="font-sans text-sm text-stone-500 mt-1">{club.description}</p>
          )}
          <p className="font-sans text-xs text-stone-400 mt-2">Created {formatDate(club.createdAt)}</p>
        </div>

        <div className="space-y-2">
          {club.meetingFrequency && (
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/40">
              <Users size={13} strokeWidth={1.5} className="text-stone-400" />
              <span className="font-sans text-sm text-stone-600">
                Meets {club.meetingFrequency.toLowerCase()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/40">
            <BookOpen size={13} strokeWidth={1.5} className="text-stone-400" />
            <span className="font-sans text-sm text-stone-600">Public book club</span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 space-y-4 shadow-sm">
          <p className="font-sans text-xs tracking-[0.15em] uppercase text-stone-400">Members only</p>
          <p className="font-sans text-sm text-stone-500 leading-relaxed">
            Sign in to see meetings, track your reading progress, and join this club.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full font-sans text-sm text-white bg-stone-800 rounded-full py-2.5 hover:bg-stone-700 transition-all"
          >
            Sign in to join
          </button>
        </div>
      </div>
    </div>
  )
}
