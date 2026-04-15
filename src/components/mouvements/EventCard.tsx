import Image from 'next/image'
import Link from 'next/link'
import type { FilmReleaseEvent, Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  event: FilmReleaseEvent & { film: Film }
  paysId: string
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  added:        { label: 'Nouvelle sortie',      color: 'text-cyan' },
  date_changed: { label: 'Date modifiée',         color: 'text-gold' },
  removed:      { label: 'Retiré du programme',  color: 'text-muted' },
}

export function EventCard({ event, paysId }: EventCardProps) {
  const meta = EVENT_LABELS[event.event_type] ?? EVENT_LABELS.added

  return (
    <Link
      href={`/${paysId}/films/${event.film_id}`}
      className="flex gap-4 p-4 bg-surface-card rounded-lg hover:scale-[1.01] transition-transform"
    >
      <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-surface-low relative">
        {event.film?.poster_url ? (
          <Image src={event.film.poster_url} alt={event.film.title} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">🎬</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-body font-semibold uppercase tracking-wide ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <p className="font-display font-semibold text-text text-sm truncate mb-1">
          {event.film?.title ?? event.film_id}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted font-body">
          {event.event_type === 'added' && event.new_date && (
            <span>Sortie : {formatDate(event.new_date)}</span>
          )}
          {event.event_type === 'date_changed' && event.old_date && event.new_date && (
            <span>{formatDate(event.old_date)} → {formatDate(event.new_date)}</span>
          )}
          {event.event_type === 'removed' && event.old_date && (
            <span>Était prévu le {formatDate(event.old_date)}</span>
          )}
          <span className="text-surface-card">{formatDate(event.occurred_at.split('T')[0])}</span>
        </div>
      </div>
    </Link>
  )
}
