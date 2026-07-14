import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, ChevronDown, Users, Pencil, X, Check } from 'lucide-react'
import { useClub, useClubMembers, useClubMeetings, useUpdateFrequency, useUpdateClub, useLeaveClub, useRemoveMember } from '../hooks/useClubs'
import { useCurrentUser } from '../hooks/useUser'
import AddMeetingModal from '../components/clubs/AddMeetingModal'
import BookSearchModal from '../components/clubs/BookSearchModal'
import type { Meeting } from '../types'

const FREQUENCY_OPTIONS = [
  { value: null, label: 'No schedule' },
  { value: 'Fortnightly', label: 'Fortnightly' },
  { value: 'Monthly', label: 'Monthly' },
] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function suggestNextDate(meetings: Meeting[], frequency: 'Fortnightly' | 'Monthly' | null): string | undefined {
  if (!frequency) return undefined
  const latest = meetings.find(m => new Date(m.scheduledDate) >= new Date())
    ?? meetings[0]
  if (!latest) return undefined
  const base = new Date(latest.scheduledDate)
  const next = frequency === 'Fortnightly'
    ? new Date(base.getTime() + 14 * 24 * 60 * 60 * 1000)
    : new Date(base.setMonth(base.getMonth() + 1))
  return next.toISOString().split('T')[0]
}

function MeetingStatus({ date, isNearest }: { date: string; isNearest: boolean }) {
  const isPast = new Date(date) < new Date()
  const isPlanned = !isPast && !isNearest

  const styles = isPast
    ? 'text-stone-400 border border-stone-200'
    : isPlanned
      ? 'text-stone-400 border border-stone-200 bg-stone-50'
      : 'text-emerald-700 border border-emerald-200 bg-emerald-50'

  const label = isPast ? 'Past' : isPlanned ? 'Planned' : 'Upcoming'

  return (
    <span className={`text-[10px] font-sans tracking-widest uppercase rounded-full px-2 py-0.5 ${styles}`}>
      {label}
    </span>
  )
}

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [bookMeetingId, setBookMeetingId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [confirmLeave, setConfirmLeave] = useState(false)

  const { data: club, isLoading: clubLoading } = useClub(id!)
  const { data: members = [] } = useClubMembers(id!)
  const { data: meetings = [] } = useClubMeetings(id!)
  const { data: currentUser } = useCurrentUser()
  const { mutate: updateFrequency } = useUpdateFrequency(id!)
  const { mutate: updateClub, isPending: isSavingClub } = useUpdateClub(id!)
  const { mutate: leaveClub, isPending: isLeaving } = useLeaveClub(id!)
  const { mutate: removeMember } = useRemoveMember(id!)

  const isOwner = members.some(m => m.user.id === currentUser?.id && m.role === 'owner')
  const isMember = members.some(m => m.user.id === currentUser?.id)

  function startEditing() {
    setEditName(club!.name)
    setEditDescription(club!.description ?? '')
    setEditing(true)
  }

  function saveEdit() {
    if (!editName.trim()) return
    updateClub({ name: editName.trim(), description: editDescription.trim() }, {
      onSuccess: () => setEditing(false),
    })
  }
  const suggested = suggestNextDate(meetings, club?.meetingFrequency ?? null)
  const nearestUpcomingId = meetings
    .filter(m => new Date(m.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0]?.id

  if (clubLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-stone-400 font-sans text-sm">
        Loading…
      </div>
    )
  }

  if (!club) return null

  return (
    <div className="px-4 pt-12 pb-6 space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/clubs')}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 font-sans text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Clubs
        </button>

        {editing ? (
          <div className="space-y-2">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full font-display text-2xl font-light text-stone-800 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-stone-400"
            />
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full font-sans text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-stone-400 resize-none placeholder:text-stone-300"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={isSavingClub || !editName.trim()}
                className="flex items-center gap-1.5 font-sans text-xs text-white bg-stone-800 rounded-full px-3 py-1.5 hover:bg-stone-700 transition-all disabled:opacity-50"
              >
                <Check size={11} strokeWidth={2.5} />
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="font-sans text-xs text-stone-500 border border-stone-200 rounded-full px-3 py-1.5 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-light text-stone-800">{club.name}</h1>
                {isOwner && (
                  <button onClick={startEditing} className="text-stone-300 hover:text-stone-500 transition-colors mt-1">
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
              {club.description && (
                <p className="font-sans text-sm text-stone-500 mt-1">{club.description}</p>
              )}
            </div>
            {!club.isPublic && (
              <span className="shrink-0 text-[10px] font-sans tracking-widest uppercase text-stone-400 border border-stone-200 rounded-full px-2 py-0.5 mt-1">
                Private
              </span>
            )}
          </div>
        )}

        <p className="font-sans text-xs text-stone-400 mt-2">
          Created {formatDate(club.createdAt)}
        </p>
      </div>

      {/* Meeting frequency — owner only */}
      {isOwner && (
        <div>
          <p className="text-xs font-sans tracking-widest uppercase text-stone-400 mb-2">Meeting frequency</p>
          <div className="relative inline-block">
            <select
              value={club.meetingFrequency ?? ''}
              onChange={e => updateFrequency((e.target.value || null) as 'Fortnightly' | 'Monthly' | null)}
              className="appearance-none font-sans text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl pl-4 pr-9 py-2.5 focus:outline-none focus:border-stone-400 cursor-pointer"
            >
              {FREQUENCY_OPTIONS.map(o => (
                <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} strokeWidth={1.5} className="text-stone-400" />
          <p className="text-xs font-sans tracking-widest uppercase text-stone-400">
            Members ({members.length})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-2 bg-white/60 border border-white/40 rounded-full px-3 py-1.5"
            >
              <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-sans text-stone-600 uppercase">
                {m.user.name.charAt(0)}
              </div>
              <span className="font-sans text-xs text-stone-700">{m.user.name}</span>
              {m.role === 'owner' && (
                <span className="text-[10px] font-sans tracking-widest uppercase text-stone-400">Owner</span>
              )}
              {isOwner && m.role !== 'owner' && (
                <button
                  onClick={() => removeMember(m.user.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors"
                  title={`Remove ${m.user.name}`}
                >
                  <X size={12} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meetings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} strokeWidth={1.5} className="text-stone-400" />
            <p className="text-xs font-sans tracking-widest uppercase text-stone-400">
              Meetings ({meetings.length})
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowAddMeeting(true)}
              className="text-xs font-sans text-stone-600 border border-stone-300 rounded-full px-3 py-1 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all"
            >
              + Add meeting
            </button>
          )}
        </div>

        {meetings.length === 0 ? (
          <p className="font-sans text-sm text-stone-400 py-4 text-center">
            No meetings yet.{isOwner ? ' Add your first one above.' : ''}
          </p>
        ) : (
          <div className="space-y-3">
            {meetings.map(m => (
              <div
                key={m.id}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Cover thumbnail */}
                  {m.book?.coverUrl ? (
                    <img
                      src={m.book.coverUrl}
                      alt={m.book.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-stone-100 rounded-lg shrink-0 flex items-center justify-center">
                      <BookOpen size={14} strokeWidth={1.5} className="text-stone-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm font-medium text-stone-700">
                          {formatDate(m.scheduledDate)}
                        </span>
                        <MeetingStatus date={m.scheduledDate} isNearest={m.id === nearestUpcomingId} />
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => setBookMeetingId(m.id)}
                          className="shrink-0 text-[11px] font-sans text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          {m.book ? 'Change book' : 'Add book'}
                        </button>
                      )}
                    </div>

                    {m.book ? (
                      <p className="font-sans text-sm text-stone-600 truncate">
                        {m.book.title}
                        <span className="text-stone-400"> · {m.book.author}</span>
                      </p>
                    ) : (
                      <p className="font-sans text-xs text-stone-300 italic">No book selected</p>
                    )}

                    {m.notes && (
                      <p className="font-sans text-xs text-stone-400 mt-1.5">{m.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggested next date */}
        {isOwner && club.meetingFrequency && suggested && (
          <div className="mt-3 flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
            <div>
              <p className="font-sans text-xs text-stone-400 tracking-wide">
                Suggested next ({club.meetingFrequency.toLowerCase()})
              </p>
              <p className="font-sans text-sm text-stone-600 mt-0.5">{formatDate(suggested)}</p>
            </div>
            <button
              onClick={() => setShowAddMeeting(true)}
              className="text-xs font-sans text-stone-600 border border-stone-300 rounded-full px-3 py-1 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all"
            >
              Use this date
            </button>
          </div>
        )}
      </div>

      {/* Leave club */}
      {isMember && (
        <div className="border-t border-stone-100 pt-6">
          {!confirmLeave ? (
            <button
              onClick={() => setConfirmLeave(true)}
              className="font-sans text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              Leave club
            </button>
          ) : (
            <div className="space-y-2">
              <p className="font-sans text-xs text-stone-500">
                {isOwner && members.length > 1
                  ? 'Ownership will be transferred to another member.'
                  : isOwner
                    ? 'You are the only member — this will delete the club.'
                    : 'You will be removed from this club.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => leaveClub()}
                  disabled={isLeaving}
                  className="font-sans text-xs text-white bg-red-500 rounded-full px-4 py-1.5 hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isLeaving ? 'Leaving…' : 'Confirm leave'}
                </button>
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="font-sans text-xs text-stone-500 border border-stone-200 rounded-full px-4 py-1.5 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddMeeting && (
        <AddMeetingModal
          clubId={id!}
          suggestedDate={suggested}
          onClose={() => setShowAddMeeting(false)}
        />
      )}

      {bookMeetingId && (
        <BookSearchModal
          clubId={id!}
          meetingId={bookMeetingId}
          onClose={() => setBookMeetingId(null)}
        />
      )}
    </div>
  )
}
