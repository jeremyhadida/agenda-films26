// fetchMovementsByCountry : le filtre « pas encore envoyé » ne s'applique que sur demande.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { calls } = vi.hoisted(() => ({ calls: [] as string[] }))

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))
vi.mock('./supabase', () => {
  const builder: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'order', 'limit']) {
    builder[m] = (...args: unknown[]) => { calls.push(`${m}:${JSON.stringify(args)}`); return builder }
  }
  builder.is = (...args: unknown[]) => { calls.push(`is:${JSON.stringify(args)}`); return builder }
  builder.then = (resolve: (v: unknown) => void) => resolve({ data: [], error: null })
  return { supabase: { from: () => builder } }
})

import { fetchMovementsByCountry } from './queries'

describe('fetchMovementsByCountry', () => {
  beforeEach(() => { calls.length = 0 })

  it("n'applique pas de filtre d'envoi par défaut", async () => {
    await fetchMovementsByCountry('ma')
    expect(calls.some(c => c.startsWith('is:'))).toBe(false)
  })

  it('avec onlyUnsent, ne garde que les événements dont send_id est vide', async () => {
    await fetchMovementsByCountry('ma', { onlyUnsent: true })
    expect(calls).toContain('is:["send_id",null]')
  })
})
