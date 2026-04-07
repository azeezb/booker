import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateMeeting } from '../../hooks/useClubs'

interface Props {
  clubId: string
  suggestedDate?: string
  onClose: () => void
}

export default function AddMeetingModal({ clubId, suggestedDate, onClose }: Props) {
  const [date, setDate] = useState(suggestedDate ?? '')
  const [notes, setNotes] = useState('')
  const { mutate: createMeeting, isPending } = useCreateMeeting(clubId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    createMeeting(
      { scheduledDate: new Date(date).toISOString(), notes: notes || undefined },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-light text-stone-800">Add meeting</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans tracking-widest uppercase text-stone-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full font-sans text-stone-800 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-sans tracking-widest uppercase text-stone-400 mb-1.5">
              Notes <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Meeting at Sarah's place"
              className="w-full font-sans text-stone-800 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!date || isPending}
            className="w-full font-sans text-sm tracking-wide bg-stone-800 text-white rounded-xl py-3 hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save meeting'}
          </button>
        </form>
      </div>
    </div>
  )
}
