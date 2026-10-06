import { useState } from 'react'
import { Star } from 'lucide-react'

interface RatingStarsProps {
  value: number
  onChange?: (val: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RatingStars({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className = '',
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size]

  const activeValue = hoverValue !== null ? hoverValue : value

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Rating ${value} dari 5 bintang` : 'Pilih rating bintang'}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= activeValue

        if (readOnly) {
          return (
            <Star
              key={star}
              className={`${sizeClasses} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted/30 text-muted-foreground/30'
              } shrink-0`}
              aria-hidden="true"
            />
          )
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} Bintang`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            className="p-1 -m-1 rounded-md hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-transform min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <Star
              className={`${sizeClasses} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted/20 text-muted-foreground/40'
              } transition-colors`}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
