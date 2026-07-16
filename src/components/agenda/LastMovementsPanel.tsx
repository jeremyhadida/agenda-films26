'use client'

import type { FilmReleaseEvent } from '@/lib/types'
import { filmTitle, formatDate } from '@/lib/utils'

function formatDayShort(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

const BANNER_EVENT_STYLES: Record<string, { text: string; bg: string }> = {
  added:        { text: 'text-emerald-400', bg: 'bg-emerald-500/8' },
  date_changed: { text: 'text-gold',        bg: 'bg-gold/8'        },
  removed:      { text: 'text-red-400',     bg: 'bg-red-500/8'    },
}

const BANNER_SECTIONS = [
  { key: 'added' as const,        label: 'Ajouts',      dot: 'bg-emerald-500', text: 'text-emerald-400' },
  { key: 'date_changed' as const, label: 'Modif',       dot: 'bg-gold',        text: 'text-gold'        },
  { key: 'removed' as const,      label: 'Annulations', dot: 'bg-red-500',     text: 'text-red-400'     },
] as const

function MovementBannerCard({ event }: { event: FilmReleaseEvent }) {
  const style = BANNER_EVENT_STYLES[event.event_type] ?? BANNER_EVENT_STYLES.added

  function handleClick() {
    document.getElementById(`film-${event.film_id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      onClick={handleClick}
      className={`flex gap-3 p-3 rounded-lg w-full text-left cursor-pointer hover:scale-[1.01] transition-transform ${style.bg}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text text-xs mb-0.5">
          {(event.film ? filmTitle(event.film) : event.film_id).toUpperCase()}
        </p>
        <div className="text-[10px] font-body text-muted">
          {event.event_type === 'added' && event.new_date && (
            <span>Sortie : <span className="text-text">{formatDate(event.new_date)}</span></span>
          )}
          {event.event_type === 'date_changed' && event.old_date && event.new_date && (
            <>
              <span className="line-through opacity-60">{formatDate(event.old_date)}</span>
              <span> → </span>
              <span className="text-text">{formatDate(event.new_date)}</span>
            </>
          )}
          {event.event_type === 'removed' && event.old_date && (
            <span>Était prévu le <span className="text-text">{formatDate(event.old_date)}</span></span>
          )}
        </div>
      </div>
    </button>
  )
}

interface LastMovementsPanelProps {
  events: FilmReleaseEvent[]
}

export function LastMovementsPanel({ events }: LastMovementsPanelProps) {
  const latestDay = events
    .filter(e => e.visible)
    .map(e => e.occurred_at.slice(0, 10))
    .sort()
    .reverse()[0] ?? null

  if (!latestDay) return null

  const latestDayEvents = events.filter(
    e => e.visible && e.occurred_at.slice(0, 10) === latestDay
  )

  const latestByFilm = new Map<string, FilmReleaseEvent>()
  latestDayEvents
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .forEach(e => { if (!latestByFilm.has(e.film_id)) latestByFilm.set(e.film_id, e) })

  const TYPE_ORDER: Record<string, number> = { added: 0, date_changed: 1, removed: 2 }
  const sortedEvents = Array.from(latestByFilm.values()).sort(
    (a, b) => (TYPE_ORDER[a.event_type] ?? 9) - (TYPE_ORDER[b.event_type] ?? 9)
  )

  const activeSections = BANNER_SECTIONS
    .map(s => ({ ...s, events: sortedEvents.filter(e => e.event_type === s.key) }))
    .filter(s => s.events.length > 0)

  if (activeSections.length === 0) return null

  return (
    <div className="mb-4 mx-2 mt-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="font-display font-bold text-text text-[11px] tracking-wide">
          Derniers Mouvements
        </span>
        <span className="text-muted font-body text-[10px]">({formatDayShort(latestDay)})</span>
      </div>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {activeSections.map((section, idx) => (
          <div
            key={section.key}
            className={`flex items-start gap-2 shrink-0 ${idx > 0 ? 'border-l border-[#2a4a7a]/50 pl-4 ml-4' : ''}`}
          >
            <div className="flex flex-col items-center gap-1 pt-3 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${section.dot}`} />
              <span
                className={`text-[8.5px] font-bold uppercase tracking-wider ${section.text}`}
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {section.label}
              </span>
            </div>
            <div className="flex gap-2">
              {section.events.map(event => (
                <div key={event.id} className="w-44 shrink-0">
                  <MovementBannerCard event={event} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
