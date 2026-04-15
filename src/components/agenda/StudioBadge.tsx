'use client'

interface StudioBadgeProps {
  studio: string
}

export function StudioBadge({ studio }: StudioBadgeProps) {
  const slug = studio
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return (
    <div className="mt-1.5 h-5 flex items-center">
      <img
        src={`/logos/${slug}.png`}
        alt={studio}
        className="h-full object-contain opacity-80"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const fallback = el.nextElementSibling as HTMLElement | null
          if (fallback) fallback.hidden = false
        }}
      />
      <span
        hidden
        className="text-[9px] font-body font-semibold tracking-wider text-muted/70 border border-muted/20 px-1.5 py-0.5 rounded-sm uppercase"
      >
        {studio}
      </span>
    </div>
  )
}
