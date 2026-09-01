import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { ArrowLeft, Users } from 'lucide-react'
import { usePublicClubs } from '../hooks/useClubs'
import type { Club } from '../types'

function PublicClubCard({ club }: { club: Club }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/browse/${club.id}`)}
      className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm cursor-pointer hover:bg-white/80 transition-colors"
    >
      <h3 className="font-display text-xl font-light text-stone-800 leading-tight truncate">
        {club.name}
      </h3>
      {club.description && (
        <p className="font-sans text-sm text-stone-500 mt-1 line-clamp-2">{club.description}</p>
      )}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Users size={14} strokeWidth={1.5} />
          <span className="text-xs font-sans">
            {club.meetingFrequency ? club.meetingFrequency.toLowerCase() : 'book club'}
          </span>
        </div>
        <span className="text-xs font-sans text-stone-400 tracking-wide">View →</span>
      </div>
    </div>
  )
}

export default function Browse() {
  const navigate = useNavigate()
  const { loginWithRedirect } = useAuth0()
  const { data: clubs = [], isLoading } = usePublicClubs()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 px-5 pt-12 pb-20">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 font-sans text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-400">Public clubs</p>
          <button
            onClick={() => loginWithRedirect()}
            className="text-xs font-sans text-stone-600 border border-stone-300 rounded-full px-3 py-1 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all"
          >
            Sign in to join
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && clubs.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-light text-stone-300">No public clubs yet</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {clubs.map(club => (
            <PublicClubCard key={club.id} club={club} />
          ))}
        </div>
      </div>
    </div>
  )
}
