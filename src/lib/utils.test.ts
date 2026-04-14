import { describe, it, expect } from 'vitest'
import { getIsoWeek, getWeekMonday, formatWeekLabel, formatDate, groupFilmsByWeek } from './utils'

describe('getIsoWeek', () => {
  it('returns ISO week number for a known date', () => {
    // 2026-04-14 is in week 16
    expect(getIsoWeek('2026-04-14')).toBe(16)
  })
  it('returns correct week for first week of year', () => {
    // 2026-01-05 is in week 2
    expect(getIsoWeek('2026-01-05')).toBe(2)
  })
  it('handles late-December date in ISO week 1 of next year', () => {
    expect(getIsoWeek('2025-12-29')).toBe(1)
  })
})

describe('getWeekMonday', () => {
  it('returns the monday of a given ISO week', () => {
    expect(getWeekMonday(2026, 16)).toBe('2026-04-13')
  })
  it('returns a date in prior December for week 1 when applicable', () => {
    expect(getWeekMonday(2026, 1)).toBe('2025-12-29')
  })
})

describe('formatWeekLabel', () => {
  it('formats week label in French', () => {
    expect(formatWeekLabel(16, '2026-04-13')).toBe('SEMAINE 16 — 13 avr 2026')
  })
})

describe('formatDate', () => {
  it('formats date in French short format', () => {
    expect(formatDate('2026-04-14')).toBe('14 avr 2026')
  })
})

describe('groupFilmsByWeek', () => {
  it('groups films by ISO week', () => {
    const films = [
      { id: 'film-a', title: 'Film A', release_date: '2026-04-14' },
      { id: 'film-b', title: 'Film B', release_date: '2026-04-15' },
      { id: 'film-c', title: 'Film C', release_date: '2026-04-21' },
    ] as any[]
    const groups = groupFilmsByWeek(films)
    expect(groups).toHaveLength(2)
    expect(groups[0].isoWeek).toBe(16)
    expect(groups[0].films).toHaveLength(2)
    expect(groups[1].isoWeek).toBe(17)
    expect(groups[1].films).toHaveLength(1)
  })

  it('returns empty array for empty input', () => {
    expect(groupFilmsByWeek([])).toEqual([])
  })
  it('assigns correct startDate for late-December film in next ISO year', () => {
    const films = [
      { id: 'x', title: 'X', release_date: '2025-12-29' },
    ] as any[]
    const groups = groupFilmsByWeek(films)
    expect(groups[0].startDate).toBe('2025-12-29')
  })
})
