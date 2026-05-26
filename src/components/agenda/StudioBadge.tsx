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
        className={`font-body font-semibold tracking-wider text-muted/80 border border-muted/25 rounded-sm uppercase ${
          size === 'md' ? 'text-[10px] px-2 py-0.5' : 'text-[9px] px-1.5 py-0.5'
        }`}
      >
        {studio}
      </span>
    </div>
  )
}
