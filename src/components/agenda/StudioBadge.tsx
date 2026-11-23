interface StudioBadgeProps {
  studio: string
  size?: 'sm' | 'md'
}

// Distributeur affiché en texte gras (pas de logo : les images cassaient).
export function StudioBadge({ studio, size = 'sm' }: StudioBadgeProps) {
  return (
    <span
      className={`font-body font-bold tracking-wide text-muted ${
        size === 'md' ? 'text-sm' : 'text-xs'
      }`}
    >
      {studio}
    </span>
  )
}
