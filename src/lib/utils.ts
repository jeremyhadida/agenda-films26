import type { Film, WeekGroup } from './types'

/**
 * Returns the ISO week number (1–53) for an ISO date string.
 */
export function getIsoWeek(dateStr: string): number {
  const date = new Date(dateStr)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Returns the ISO year for a date — may differ from calendar year at year boundaries.
 * (e.g., 2025-12-29 is in ISO year 2026)
 */
export function getIsoYear(dateStr: string): number {
  const date = new Date(dateStr)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  return d.getUTCFullYear()
}

/**
 * Returns the ISO date of the Monday of a given ISO week.
 */
export function getWeekMonday(year: number, isoWeek: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (isoWeek - 1) * 7)
  return monday.toISOString().split('T')[0]
}

const FR_MONTHS = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']

/**
 * Formats a week label: "SEMAINE 16 — 13 avr 2026"
 */
export function formatWeekLabel(isoWeek: number, mondayDate: string): string {
  const d = new Date(mondayDate + 'T00:00:00Z')
  const day = d.getUTCDate()
  const month = FR_MONTHS[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `SEMAINE ${isoWeek} — ${day} ${month} ${year}`
}

/**
 * Formats duration in minutes as "1h45" or "0h30"
 */
export function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`
}

/**
 * Formats an ISO date string as "14 avr 2026"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return `${d.getUTCDate()} ${FR_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Formats an ISO date string as "14 avr" (day + month, no year).
 */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return `${d.getUTCDate()} ${FR_MONTHS[d.getUTCMonth()]}`
}

const FR_MONTHS_FULL = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

export function formatMonthFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return `${FR_MONTHS_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Returns a formatted week date range (Monday → Sunday) in French.
 * Same month:  "08 — 14 avr 2026"
 * Cross-month: "28 avr — 04 mai 2026"
 */
export function formatWeekDateRange(startDate: string): string {
  const start = new Date(startDate + 'T00:00:00Z')
  const end = new Date(startDate + 'T00:00:00Z')
  end.setUTCDate(end.getUTCDate() + 6) // dimanche

  const startDay   = start.getUTCDate()
  const endDay     = end.getUTCDate()
  const startMonth = FR_MONTHS[start.getUTCMonth()]
  const endMonth   = FR_MONTHS[end.getUTCMonth()]
  const endYear    = end.getUTCFullYear()

  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${startDay} — ${endDay} ${endMonth} ${endYear}`
  } else {
    return `${startDay} ${startMonth} — ${endDay} ${endMonth} ${endYear}`
  }
}

/**
 * Groups a list of films (with release_date) by ISO week, sorted chronologically.
 */
export function groupFilmsByWeek(
  films: (Film & { release_date: string })[]
): WeekGroup[] {
  if (films.length === 0) return []

  const weekMap = new Map<string, WeekGroup>()

  for (const film of films) {
    const week = getIsoWeek(film.release_date)
    const isoYear = getIsoYear(film.release_date)
    const mapKey = `${isoYear}-${week}`
    if (!weekMap.has(mapKey)) {
      const monday = getWeekMonday(isoYear, week)
      weekMap.set(mapKey, {
        isoWeek: week,
        label: formatWeekLabel(week, monday),
        startDate: monday,
        films: [],
      })
    }
    weekMap.get(mapKey)!.films.push(film)
  }

  return Array.from(weekMap.values()).sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export function fillWeekGaps(groups: WeekGroup[]): WeekGroup[] {
  if (groups.length < 2) return groups
  const existingDates = new Map(groups.map(g => [g.startDate, g]))
  const result: WeekGroup[] = []
  const cursor = new Date(groups[0].startDate + 'T00:00:00Z')
  const end    = new Date(groups[groups.length - 1].startDate + 'T00:00:00Z')
  while (cursor <= end) {
    const iso = cursor.toISOString().split('T')[0]
    if (existingDates.has(iso)) {
      result.push(existingDates.get(iso)!)
    } else {
      const week = getIsoWeek(iso)
      result.push({ isoWeek: week, label: formatWeekLabel(week, iso), startDate: iso, films: [] })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 7)
  }
  return result
}
