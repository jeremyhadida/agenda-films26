// Le PDF est joint à une newsletter envoyée juste après une modification de dates :
// il doit refléter la base à l'instant de la requête, pas le cache de 5 minutes des pages.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { cached, fresh } = vi.hoisted(() => ({ cached: {
  getAgendaByCountry: vi.fn(async () => []),
  getMovementsByCountry: vi.fn(async () => []),
  getActiveCountries: vi.fn(async () => []),
}, fresh: {
  fetchAgendaByCountry: vi.fn(async () => []),
  fetchMovementsByCountry: vi.fn(async () => []),
  fetchActiveCountries: vi.fn(async () => [{ id: 'ma', name: 'Maroc', region: 'Maghreb' }]),
} }))

vi.mock('@/lib/queries', () => ({ ...cached, ...fresh }))
vi.mock('@/lib/pdf/AgendaPdfDocument', () => ({ AgendaPdfDocument: () => null }))
vi.mock('@react-pdf/renderer', () => ({
  renderToStream: vi.fn(async () => new ReadableStream()),
}))

import { GET } from './route'

describe('GET /api/pdf/[pays]', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('lit la base directement (sans le cache de 5 minutes)', async () => {
    const res = await GET(new Request('http://x/api/pdf/ma'), { params: Promise.resolve({ pays: 'ma' }) })
    expect(res.status).toBe(200)
    expect(fresh.fetchAgendaByCountry).toHaveBeenCalledWith('ma')
    expect(fresh.fetchMovementsByCountry).toHaveBeenCalledWith('ma')
    expect(fresh.fetchActiveCountries).toHaveBeenCalled()
    expect(cached.getAgendaByCountry).not.toHaveBeenCalled()
    expect(cached.getMovementsByCountry).not.toHaveBeenCalled()
    expect(cached.getActiveCountries).not.toHaveBeenCalled()
  })

  it('répond 404 pour un pays inconnu', async () => {
    const res = await GET(new Request('http://x/api/pdf/zz'), { params: Promise.resolve({ pays: 'zz' }) })
    expect(res.status).toBe(404)
  })
})
