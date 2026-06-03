import { renderToStream } from '@react-pdf/renderer'
import { createElement } from 'react'
import { getAgendaByCountry, getActiveCountries, getMovementsByCountry } from '@/lib/queries'
import { AgendaPdfDocument } from '@/lib/pdf/AgendaPdfDocument'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pays: string }> }
) {
  const { pays } = await params

  const [films, events, countries] = await Promise.all([
    getAgendaByCountry(pays),
    getMovementsByCountry(pays),
    getActiveCountries(),
  ])

  const country = countries.find(c => c.id === pays)
  if (!country) {
    return new Response('Pays introuvable', { status: 404 })
  }

  const today = new Date()
  const dow = today.getUTCDay() || 7
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  monday.setUTCDate(monday.getUTCDate() - dow + 1)
  const currentMondayStr = monday.toISOString().split('T')[0]
  const filmsFromNow = films.filter(f => f.release_date >= currentMondayStr)

  const pad = (n: number) => String(n).padStart(2, '0')
  const dateLabel = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const filename = `agenda-${pays}-${dateLabel}.pdf`

  const docElement = createElement(AgendaPdfDocument, {
    country,
    films: filmsFromNow,
    events,
    generatedAt: today,
  })

  const stream = await renderToStream(docElement as any)

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
