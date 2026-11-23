import type { Film, FilmReleaseEvent } from '@/lib/types'

export type FilmWithDate = Film & { release_date: string }
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

/**
 * Mouvements « en attente d'envoi » d'un pays, réduits à leur effet net par film : même règle
 * que le corps du mail (Forecast tool, lib/diffusion.ts). Ajout puis retrait = rien ; date
 * changée puis rétablie = rien ; un film dont un mouvement est masqué est exclu en entier.
 * Cumule tous les jours en attente. Résultat trié du plus récent au plus ancien.
 */
export function netPendingMovements<T extends FilmReleaseEvent>(events: T[]): T[] {
  const byFilm = new Map<string, T[]>()
  for (const e of events) {
    const list = byFilm.get(e.film_id)
    if (list) list.push(e)
    else byFilm.set(e.film_id, [e])
  }

  const result: T[] = []
  for (const list of byFilm.values()) {
    if (list.some(e => !e.visible)) continue
    const sorted = list.slice().sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const before = first.event_type === 'added' ? null : first.old_date
    let current: string | null = before
    for (const e of sorted) current = e.event_type === 'removed' ? null : e.new_date

    if (before === null && current === null) continue
    if (before === null) result.push({ ...last, event_type: 'added', old_date: null, new_date: current })
    else if (current === null) result.push({ ...last, event_type: 'removed', old_date: before, new_date: null })
    else if (before !== current) result.push({ ...last, event_type: 'date_changed', old_date: before, new_date: current })
  }
  return result.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

const WEEKDAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

// Aligné sur le format du corps de l'email (send-mailing) : "Vendredi 02 février 2025".
export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr)
  const weekday = WEEKDAYS_FR[d.getUTCDay()]
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = MONTHS_FR_LOWER[d.getUTCMonth()]
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} ${month} ${d.getUTCFullYear()}`
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
  const dayEvents = visible.filter(e => e.occurred_at.slice(0, 10) === mostRecentDay)

  // Un seul événement par film (le plus récent) : un titre est soit ajouté, soit modifié, jamais les deux.
  const latestByFilm = new Map<string, FilmReleaseEvent>()
  for (const e of dayEvents) {
    if (!latestByFilm.has(e.film_id)) latestByFilm.set(e.film_id, e)
  }

  // Liste complète du jour, non tronquée : l'appelant décide de l'affichage
  // (le corps de l'email affiche tout, la page de garde du PDF cape et l'indique).
  return Array.from(latestByFilm.values())
}
