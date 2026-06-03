import type { FilmReleaseEvent } from '@/lib/types'

export type FilmWithDate = { id: string; release_date: string; [key: string]: any }
export type MonthGroup = { month: string; films: FilmWithDate[] }

const MONTHS_FR = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE',
]

const MONTHS_FR_LOWER = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

export function groupFilmsByMonth(films: FilmWithDate[]): MonthGroup[] {
  const map = new Map<string, FilmWithDate[]>()
  for (const film of films) {
    const d = new Date(film.release_date)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(film)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, films]) => {
      const [year, month] = key.split('-')
      return { month: `${MONTHS_FR[parseInt(month) - 1]} ${year}`, films }
    })
}

export function getLatestEventByFilm(
  events: FilmReleaseEvent[]
): Map<string, 'added' | 'date_changed'> {
  const map = new Map<string, 'added' | 'date_changed'>()
  for (const event of events) {
    if (!event.visible) continue
    if (event.event_type === 'removed') continue
    if (!map.has(event.film_id)) {
      map.set(event.film_id, event.event_type as 'added' | 'date_changed')
    }
  }
  return map
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

export function formatGenerationDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_FR_LOWER[date.getMonth()]} ${date.getFullYear()}`
}

export function truncateCast(cast: string | null, limit = 2): string {
  if (!cast) return '—'
  const names = cast.split(',').map(s => s.trim()).filter(Boolean)
  if (names.length === 0) return '—'
  if (names.length <= limit) return names.join(', ')
  return `${names.slice(0, limit).join(', ')}…`
}

export function getRecentMovements(events: FilmReleaseEvent[]): FilmReleaseEvent[] {
  const visible = events.filter(e => e.visible)
  if (visible.length === 0) return []
  const mostRecentDay = visible[0].occurred_at.slice(0, 10)
  return visible.filter(e => e.occurred_at.slice(0, 10) === mostRecentDay).slice(0, 12)
}
