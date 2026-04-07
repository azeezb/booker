import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Club } from '../../types'

interface Props {
  club: Club
  isMember?: boolean
  onJoin?: (id: string) => void
}

export default function ClubCard({ club, isMember, onJoin }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (isMember) navigate(`/clubs/${club.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm ${isMember ? 'cursor-pointer hover:bg-white/80 transition-colors' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-light text-stone-800 leading-tight truncate">
            {club.name}
          </h3>
          {club.description && (
            <p className="font-sans text-sm text-stone-500 mt-1 line-clamp-2">
              {club.description}
            </p>
          )}
        </div>
        {!club.isPublic && (
          <span className="shrink-0 text-[10px] font-sans tracking-widest uppercase text-stone-400 border border-stone-200 rounded-full px-2 py-0.5">
            Private
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Users size={14} strokeWidth={1.5} />
          <span className="text-xs font-sans">Book club</span>
        </div>

        {onJoin && !isMember && (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(club.id) }}
            className="text-xs font-sans tracking-wide text-stone-600 border border-stone-300 rounded-full px-3 py-1 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all"
          >
            Join
          </button>
        )}

        {isMember && (
          <span className="text-xs font-sans text-stone-400 tracking-wide">Member</span>
        )}
      </div>
    </div>
  )
}
