import type { FilmReleaseEvent, Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: (FilmReleaseEvent & { film: Film })[]
  paysId: string
}

const TYPE_ORDER: Record<string, number> = {
  added: 0,
  date_changed: 1,
  removed: 2,
}

const TYPE_SECTION_LABELS: Record<string, { label: string; dot: string }> = {
  added:        { label: 'Nouvelles sorties',      dot: 'bg-emerald-500' },
  date_changed: { label: 'Dates modifiées',         dot: 'bg-gold' },
  removed:      { label: 'Déprogrammations',        dot: 'bg-red-500' },
}

function groupAndSort(events: (FilmReleaseEvent & { film: Film })[]) {
  // Group by day (occurred_at date)
  const dayMap = new Map<string, (FilmReleaseEvent & { film: Film })[]>()

  for (const event of events) {
    const day = event.occurred_at.split('T')[0]
    if (!dayMap.has(day)) dayMap.set(day, [])
    dayMap.get(day)!.push(event)
  }

  // Sort days descending (most recent first)
  const days = Array.from(dayMap.entries()).sort((a, b) => b[0].localeCompare(a[0]))

  // Within each day: sort by type order, then by release date
  for (const [, list] of days) {
    list.sort((a, b) => {
      const typeOrder = (TYPE_ORDER[a.event_type] ?? 9) - (TYPE_ORDER[b.event_type] ?? 9)
      if (typeOrder !== 0) return typeOrder
      const dateA = a.new_date ?? a.old_date ?? ''
      const dateB = b.new_date ?? b.old_date ?? ''
      return dateA.localeCompare(dateB)
    })
  }

  return days
}

export function EventFeed({ events, paysId }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-display text-muted text-lg">Aucun mouvement récent.</p>
      </div>
    )
  }

  const days = groupAndSort(events)

  return (
    <div className="flex flex-col gap-10">
      {days.map(([day, dayEvents]) => {
        // Group by type within the day
        const byType = new Map<string, (FilmReleaseEvent & { film: Film })[]>()
        for (const event of dayEvents) {
          if (!byType.has(event.event_type)) byType.set(event.event_type, [])
          byType.get(event.event_type)!.push(event)
        }
        const types = Array.from(byType.entries()).sort(
          ([a], [b]) => (TYPE_ORDER[a] ?? 9) - (TYPE_ORDER[b] ?? 9)
        )

        return (
          <section key={day}>
            {/* Date du jour */}
            <div className="mb-4">
              <h2 className="font-display font-bold text-text text-lg md:text-xl">
                {formatDate(day)}
              </h2>
              <div className="mt-1 h-px bg-gold/15 w-16" />
            </div>

            <div className="flex flex-col gap-6">
              {types.map(([type, typeEvents]) => {
                const section = TYPE_SECTION_LABELS[type]
                return (
                  <div key={type}>
                    {/* Sous-titre par type */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${section?.dot ?? 'bg-muted'}`} />
                      <span className="text-xs font-body font-semibold uppercase tracking-wider text-muted">
                        {section?.label ?? type}
                      </span>
                      <span className="text-xs text-muted/50 font-body">
                        ({typeEvents.length})
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {typeEvents.map(event => (
                        <EventCard key={event.id} event={event} paysId={paysId} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
