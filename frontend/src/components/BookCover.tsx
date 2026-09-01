import { useState } from 'react'
import { BookOpen } from 'lucide-react'

interface Props {
  coverUrl: string | null | undefined
  isbn?: string | null
  title: string
  className?: string
  placeholderClassName?: string
  iconSize?: number
}

export default function BookCover({
  coverUrl,
  isbn,
  title,
  className,
  placeholderClassName,
  iconSize = 14,
}: Props) {
  const olUrl = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null
  const [src, setSrc] = useState<string | null>(coverUrl ?? olUrl)

  function handleError() {
    if (src !== olUrl && olUrl) {
      setSrc(olUrl)
    } else {
      console.log(`[BookCover] no cover found for "${title}"`, { coverUrl, isbn })
      setSrc(null)
    }
  }

  if (!src) {
    return (
      <div className={placeholderClassName}>
        <BookOpen size={iconSize} strokeWidth={1.5} className="text-stone-300" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={title}
      className={className}
      onError={handleError}
    />
  )
}
