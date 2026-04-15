import Image from 'next/image'
import Link from 'next/link'
import type { FilmReleaseEvent, Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  event: FilmReleaseEvent & { film: Film }
  paysId: string
}

const EVENT_STYLES: Record<string, { label: string; bar: string; text: string; bg: string }> = {
  added: {
    label: 'Nouvelle sortie',
    bar:   'bg-emerald-500',
    text:  'text-emerald-400',
    bg:    'bg-emerald-500/8',
  },
  date_changed: {
    label: 'Date modifiée',
    bar:   'bg-gold',
    text:  'text-gold',
    bg:    'bg-gold/8',
  },
  removed: {
    label: 'Déprogrammé',
    bar:   'bg-red-500',
    text:  'text-red-400',
    bg:    'bg-red-500/8',
  },
}

export function EventCard({ event, paysId }: EventCardProps) {
  const style = EVENT_STYLES[event.event_type] ?? EVENT_STYLES.added

  return (
    <Link
      href={`/${paysId}/films/${event.film_id}`}
      className={`flex gap-4 p-4 rounded-lg hover:scale-[1.01] transition-transform border-l-2 ${style.bar} ${style.bg}`}
    >
      <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 bg-surface-low relative">
        {event.film?.poster_url ? (
          <Image
            src={event.film.poster_url}
            alt={event.film.title ?? ''}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">🎬</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text text-sm truncate mb-1">
          {event.film?.title ?? event.film_id}
        </p>
        <div className="text-xs font-body text-muted">
          {event.event_type === 'added' && event.new_date && (
            <span>Sortie : <span className="text-text">{formatDate(event.new_date)}</span></span>
          )}
          {event.event_type === 'date_changed' && event.old_date && event.new_date && (
            <span>
              <span className="line-through opacity-60">{formatDate(event.old_date)}</span>
              {' → '}
              <span className="text-text">{formatDate(event.new_date)}</span>
            </span>
          )}
          {event.event_type === 'removed' && event.old_date && (
            <span>Était prévu le <span className="text-text">{formatDate(event.old_date)}</span></span>
          )}
        </div>
      </div>
    </Link>
  )
}
