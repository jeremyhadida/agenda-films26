import type { FilmReleaseEvent, Film } from '@/lib/types'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: (FilmReleaseEvent & { film: Film })[]
  paysId: string
}

export function EventFeed({ events, paysId }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-display text-muted text-lg">Aucun mouvement récent.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map(event => (
        <EventCard key={event.id} event={event} paysId={paysId} />
      ))}
    </div>
  )
}
