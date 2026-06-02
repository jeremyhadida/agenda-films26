import { describe, it, expect } from 'vitest'
import {
  groupFilmsByMonth,
  getLatestEventByFilm,
  formatDateShort,
  formatGenerationDate,
  truncateCast,
  getRecentMovements,
} from './utils'

const makeFilm = (id: string, release_date: string) =>
  ({ id, title: `Film ${id}`, release_date } as any)

const makeEvent = (film_id: string, event_type: string, occurred_at: string, visible = true) =>
  ({ id: film_id, film_id, event_type, occurred_at, visible, old_date: null, new_date: null, country_id: 'ci' } as any)

describe('groupFilmsByMonth', () => {
  it('groupe par mois et trie chronologiquement', () => {
    const films = [
      makeFilm('a', '2026-06-15'),
      makeFilm('b', '2026-07-03'),
      makeFilm('c', '2026-06-01'),
    ]
    const result = groupFilmsByMonth(films)
    expect(result).toHaveLength(2)
    expect(result[0].month).toBe('JUIN 2026')
    expect(result[0].films).toHaveLength(2)
    expect(result[1].month).toBe('JUILLET 2026')
  })

  it('retourne un tableau vide pour un input vide', () => {
    expect(groupFilmsByMonth([])).toHaveLength(0)
  })
})

describe('getLatestEventByFilm', () => {
  it('retourne le type du dernier événement visible par film', () => {
    const events = [
      makeEvent('film1', 'date_changed', '2026-06-02T10:00:00Z'),
      makeEvent('film1', 'added', '2026-05-01T10:00:00Z'),
      makeEvent('film2', 'added', '2026-06-01T10:00:00Z'),
      makeEvent('film3', 'removed', '2026-06-01T10:00:00Z'),
    ]
    const map = getLatestEventByFilm(events)
    expect(map.get('film1')).toBe('date_changed')
    expect(map.get('film2')).toBe('added')
    expect(map.has('film3')).toBe(false)
  })

  it('ignore les événements non visibles', () => {
    const events = [makeEvent('film1', 'added', '2026-06-01T10:00:00Z', false)]
    const map = getLatestEventByFilm(events)
    expect(map.has('film1')).toBe(false)
  })
})

describe('formatDateShort', () => {
  it('formate en jj/mm', () => {
    expect(formatDateShort('2026-06-04')).toBe('04/06')
    expect(formatDateShort('2026-12-25')).toBe('25/12')
  })
})

describe('formatGenerationDate', () => {
  it('formate en "2 juin 2026"', () => {
    expect(formatGenerationDate(new Date('2026-06-02T12:00:00'))).toBe('2 juin 2026')
  })
})

describe('truncateCast', () => {
  it('retourne les 2 premiers acteurs avec ellipse', () => {
    expect(truncateCast('Alice, Bob, Charlie')).toBe('Alice, Bob…')
  })
  it('retourne tel quel si 2 noms ou moins', () => {
    expect(truncateCast('Alice, Bob')).toBe('Alice, Bob')
  })
  it('retourne "—" si null', () => {
    expect(truncateCast(null)).toBe('—')
  })
  it('retourne "—" si chaîne vide', () => {
    expect(truncateCast('')).toBe('—')
  })
})

describe('getRecentMovements', () => {
  it('retourne uniquement les événements du jour le plus récent', () => {
    const events = [
      makeEvent('film1', 'added', '2026-06-02T10:00:00Z'),
      makeEvent('film2', 'date_changed', '2026-06-02T09:00:00Z'),
      makeEvent('film3', 'added', '2026-06-01T12:00:00Z'),
    ]
    const result = getRecentMovements(events)
    expect(result).toHaveLength(2)
    expect(result.every(e => e.occurred_at.startsWith('2026-06-02'))).toBe(true)
  })

  it('exclut les événements "removed"', () => {
    const events = [makeEvent('film1', 'removed', '2026-06-02T10:00:00Z')]
    expect(getRecentMovements(events)).toHaveLength(0)
  })

  it('retourne un tableau vide si aucun événement', () => {
    expect(getRecentMovements([])).toHaveLength(0)
  })
})
