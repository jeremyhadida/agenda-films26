// Rendu réel (sans mock) du PDF joint à la newsletter, en mode « mouvements en attente ».
import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { AgendaPdfDocument } from './AgendaPdfDocument'

const country = { id: 'ma', name: 'Maroc', region: 'Maghreb' } as any
const film = { id: 'f1', title: 'Film test', title_vf: null, studio: 'S', release_date: '2026-12-11', genre: null, status: 'validated' } as any
const event = (id: string, film_id: string) =>
  ({ id, film_id, country_id: 'ma', event_type: 'added', old_date: null, new_date: '2026-12-11', visible: true, occurred_at: '2026-11-22T10:00:00Z', film }) as any

describe('AgendaPdfDocument en mode pending', () => {
  it('produit un PDF valide sans aucun mouvement (rappel du line-up)', async () => {
    const buf = await renderToBuffer(createElement(AgendaPdfDocument, {
      country, films: [film], events: [], generatedAt: new Date('2026-11-23'), movementsMode: 'pending',
    }) as any)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('produit un PDF valide avec des mouvements cumulés', async () => {
    const buf = await renderToBuffer(createElement(AgendaPdfDocument, {
      country, films: [film], events: [event('e1', 'f1'), { ...event('e2', 'f2'), occurred_at: '2026-11-23T09:00:00Z' }],
      generatedAt: new Date('2026-11-23'), movementsMode: 'pending',
    }) as any)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })
})
