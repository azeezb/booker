import { useState, useEffect, useRef } from 'react'
import { X, Search, BookOpen } from 'lucide-react'
import { useBookSearch } from '../../hooks/useBooks'
import { useUpsertBook } from '../../hooks/useBooks'
import { useUpdateMeeting } from '../../hooks/useClubs'

interface Props {
  clubId: string
  meetingId: string
  onClose: () => void
}

export default function BookSearchModal({ clubId, meetingId, onClose }: Props) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: results = [], isFetching } = useBookSearch(query)
  const { mutate: upsertBook, isPending: isUpserting } = useUpsertBook()
  const { mutate: updateMeeting, isPending: isUpdating } = useUpdateMeeting(clubId)

  const isBusy = isUpserting || isUpdating

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setQuery(input.trim()), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  function handleSelect(result: typeof results[number]) {
    upsertBook(result, {
      onSuccess: (book) => {
        updateMeeting({ meetingId, bookId: book.id }, { onSuccess: onClose })
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="font-display text-2xl font-light text-stone-800">Add a book</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 pb-4 shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Search by title or author…"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full font-sans text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-stone-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto px-6 pb-6 space-y-2">
          {isFetching && (
            <p className="font-sans text-sm text-stone-400 text-center py-6">Searching…</p>
          )}

          {!isFetching && query.length >= 2 && results.length === 0 && (
            <p className="font-sans text-sm text-stone-400 text-center py-6">No results found.</p>
          )}

          {!isFetching && results.map(book => (
            <div
              key={book.googleBookId}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-50 transition-colors"
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-10 h-14 bg-stone-100 rounded-lg shrink-0 flex items-center justify-center">
                  <BookOpen size={16} strokeWidth={1.5} className="text-stone-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-stone-800 truncate">{book.title}</p>
                <p className="font-sans text-xs text-stone-400 truncate">{book.author}</p>
                {book.pages && (
                  <p className="font-sans text-xs text-stone-300 mt-0.5">{book.pages} pages</p>
                )}
              </div>

              <button
                onClick={() => handleSelect(book)}
                disabled={isBusy}
                className="shrink-0 text-xs font-sans text-stone-600 border border-stone-300 rounded-full px-3 py-1.5 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all disabled:opacity-40"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
