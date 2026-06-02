import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getActiveCountries, getAgendaByCountry, getMovementsByCountry } from '@/lib/queries'
import { groupFilmsByWeek, fillWeekGaps } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { LastMovementsPanel } from '@/components/agenda/LastMovementsPanel'
import { AgendaPageClient } from '@/components/agenda/AgendaPageClient'

export const revalidate = 3600

export async function generateStaticParams() {
  const countries = await getActiveCountries()
  return countries.map(c => ({ pays: c.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string }>
}): Promise<Metadata> {
  const { pays } = await params
  const countries = await getActiveCountries()
  const country = countries.find(c => c.id === pays)
  return {
    title: country ? `Agenda ${country.name} — Films 26` : 'Agenda Films 26',
  }
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ pays: string }>
}) {
  const { pays } = await params
  const [countries, films, events] = await Promise.all([
    getActiveCountries(),
    getAgendaByCountry(pays),
    getMovementsByCountry(pays),
  ])

  const country = countries.find(c => c.id === pays)
  if (!country) notFound()

  const groups    = groupFilmsByWeek(films)
  const allGroups = fillWeekGaps(groups)

  return (
    <>
      <Header currentCountryId={pays} />
      <main className="max-w-7xl mx-auto px-4 pb-24 md:pb-8">
        {allGroups.length > 0 ? (
          <>
            <LastMovementsPanel events={events} paysId={pays} />
            <AgendaPageClient allGroups={allGroups} events={events} paysId={pays} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="font-display text-muted text-lg">
              Aucune sortie programmée pour le moment.
            </p>
          </div>
        )}
      </main>
      <Footer />
      <MobileNav paysId={pays} />
    </>
  )
}
