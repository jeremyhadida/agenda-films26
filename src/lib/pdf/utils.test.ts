import { describe, it, expect } from 'vitest'
import {
  groupFilmsByMonth,
  getLatestEventByFilm,
  formatDateShort,
  formatDateLong,
  formatGenerationDate,
  truncateCast,
  getRecentMovements,
  netPendingMovements,
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

  it('retourne un tableau vide si aucun événement', () => {
    expect(getRecentMovements([])).toHaveLength(0)
  })

  it('ne tronque pas au-delà de 12 événements : la limite d\'affichage revient à l\'appelant', () => {
    const events = Array.from({ length: 20 }, (_, i) =>
      makeEvent(`film${i}`, 'added', '2026-06-02T10:00:00Z')
    )
    expect(getRecentMovements(events)).toHaveLength(20)
  })
})

describe('formatDateLong', () => {
  it('formate en "Weekday jj mois aaaa" comme le corps de l\'email', () => {
    // 2026-06-02 est un mardi
    expect(formatDateLong('2026-06-02')).toBe('Mardi 02 juin 2026')
  })
})

// netPendingMovements : doit donner le même résultat que le corps du mail (Forecast tool,
// lib/diffusion.ts : effet net par film, mouvement masqué = film exclu).
describe('netPendingMovements', () => {
  const ev = (film_id: string, event_type: 'added' | 'date_changed' | 'removed',
    old_date: string | null, new_date: string | null, occurred_at: string, visible = true) =>
    ({ id: `${film_id}-${occurred_at}`, film_id, country_id: 'ma', event_type, old_date, new_date, visible, occurred_at } as any)

  it('cumule les mouvements de plusieurs jours (pas seulement le plus récent)', () => {
    const r = netPendingMovements([
      ev('a', 'added', null, '2026-12-11', '2026-11-22T10:00:00Z'),
      ev('b', 'added', null, '2026-12-18', '2026-11-23T10:00:00Z'),
    ])
    expect(r.map(e => e.film_id).sort()).toEqual(['a', 'b'])
  })

  it('ajout puis changement de date donne un ajout à la dernière date', () => {
    const r = netPendingMovements([
      ev('a', 'added', null, '2026-12-11', '2026-11-22T10:00:00Z'),
      ev('a', 'date_changed', '2026-12-11', '2026-12-18', '2026-11-23T10:00:00Z'),
    ])
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ event_type: 'added', old_date: null, new_date: '2026-12-18' })
  })

  it('ajout puis retrait ne donne rien', () => {
    expect(netPendingMovements([
      ev('a', 'added', null, '2026-12-11', '2026-11-22T10:00:00Z'),
      ev('a', 'removed', '2026-12-11', null, '2026-11-22T11:00:00Z'),
    ])).toEqual([])
  })

  it('une date changée puis rétablie ne donne rien', () => {
    expect(netPendingMovements([
      ev('a', 'date_changed', '2026-12-11', '2026-12-18', '2026-11-22T10:00:00Z'),
      ev('a', 'date_changed', '2026-12-18', '2026-12-11', '2026-11-22T11:00:00Z'),
    ])).toEqual([])
  })

  it('retrait puis ajout à une autre date donne une modification', () => {
    const r = netPendingMovements([
      ev('a', 'removed', '2026-12-11', null, '2026-11-22T10:00:00Z'),
      ev('a', 'added', null, '2026-12-18', '2026-11-22T11:00:00Z'),
    ])
    expect(r[0]).toMatchObject({ event_type: 'date_changed', old_date: '2026-12-11', new_date: '2026-12-18' })
  })

  it('un mouvement masqué exclut tout le film (comme le mail)', () => {
    expect(netPendingMovements([
      ev('a', 'added', null, '2026-12-11', '2026-11-22T10:00:00Z'),
      ev('a', 'removed', '2026-12-11', null, '2026-11-22T11:00:00Z', false),
    ])).toEqual([])
  })

  it('liste vide sans événement', () => {
    expect(netPendingMovements([])).toEqual([])
  })
})
