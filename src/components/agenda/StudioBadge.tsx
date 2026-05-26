'use client'

interface StudioBadgeProps {
  studio: string
  size?: 'sm' | 'md'
}

export function StudioBadge({ studio, size = 'sm' }: StudioBadgeProps) {
  const slug = studio
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const heightClass = size === 'md' ? 'h-7' : 'h-5'

  return (
    <div className={`flex items-center ${heightClass}`}>
      <img
        src={`/logos/${slug}.png`}
        alt={studio}
        className="h-full object-contain opacity-90"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const fallback = el.nextElementSibling as HTMLElement | null
          if (fallback) fallback.hidden = false
        }}
      />
      <span
        hidden
        className={`font-body font-semibold tracking-widest text-muted/60 uppercase ${
          size === 'md' ? 'text-[10px]' : 'text-[8px]'
        }`}
      >
        {studio}
      </span>
    </div>
  )
}
