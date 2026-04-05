import { useState } from 'react'
import { Plus } from 'lucide-react'
import { usePublicClubs, useMyClubs, useCreateClub, useJoinClub } from '../hooks/useClubs'
import ClubCard from '../components/clubs/ClubCard'
import CreateClubForm from '../components/clubs/CreateClubForm'

export default function Clubs() {
  const [showForm, setShowForm] = useState(false)

  const { data: publicClubs = [] } = usePublicClubs()
  const { data: myClubs = [] } = useMyClubs()
  const createClub = useCreateClub()
  const joinClub = useJoinClub()

  const myClubIds = new Set(myClubs.map(c => c.id))
  const publicNotJoined = publicClubs.filter(c => !myClubIds.has(c.id))

  return (
    <div className="flex-1 px-5 pt-24 pb-32">
      <div className="flex items-center justify-between mb-6">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-400">Clubs</p>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <Plus size={18} strokeWidth={1.5} />
          <span className="font-sans text-sm">New</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateClubForm
            onSubmit={(name, description, isPublic) =>
              createClub.mutateAsync({ name, description, isPublic }).then(() => setShowForm(false))
            }
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {myClubs.length > 0 && (
        <section className="mb-8">
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3">My Clubs</p>
          <div className="flex flex-col gap-3">
            {myClubs.map(club => (
              <ClubCard key={club.id} club={club} isMember />
            ))}
          </div>
        </section>
      )}

      {publicNotJoined.length > 0 && (
        <section>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3">Discover</p>
          <div className="flex flex-col gap-3">
            {publicNotJoined.map(club => (
              <ClubCard
                key={club.id}
                club={club}
                onJoin={id => joinClub.mutate(id)}
              />
            ))}
          </div>
        </section>
      )}

      {myClubs.length === 0 && publicNotJoined.length === 0 && !showForm && (
        <div className="text-center mt-20">
          <p className="font-display text-3xl font-light text-stone-300">No clubs yet</p>
          <p className="font-sans text-sm text-stone-400 mt-2">Create one to get started</p>
        </div>
      )}
    </div>
  )
}
