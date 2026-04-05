import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onSubmit: (name: string, description: string, isPublic: boolean) => Promise<void>
  onClose: () => void
}

export default function CreateClubForm({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit(name.trim(), description.trim(), isPublic)
    setLoading(false)
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-light text-stone-800">New Club</h2>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Club name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full font-sans text-sm text-stone-800 bg-white/60 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-stone-400 placeholder:text-stone-300"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full font-sans text-sm text-stone-800 bg-white/60 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-stone-400 placeholder:text-stone-300 resize-none"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsPublic(p => !p)}
            className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-stone-800' : 'bg-stone-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="font-sans text-sm text-stone-600">Public club</span>
        </label>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="mt-1 w-full bg-stone-800 text-white font-sans text-xs tracking-widest uppercase rounded-xl py-3 hover:bg-stone-700 transition-colors disabled:opacity-40"
        >
          {loading ? 'Creating…' : 'Create Club'}
        </button>
      </form>
    </div>
  )
}
