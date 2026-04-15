import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getActiveCountries, getAgendaByCountry } from '@/lib/queries'
import { groupFilmsByWeek } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { MonthTabs } from '@/components/agenda/MonthTabs'
import { WeekSection } from '@/components/agenda/WeekSection'

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
  const [countries, films] = await Promise.all([
    getActiveCountries(),
    getAgendaByCountry(pays),
  ])

  const country = countries.find(c => c.id === pays)
  if (!country) notFound()

  const groups = groupFilmsByWeek(films)

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="max-w-7xl mx-auto px-4 pb-24 md:pb-8">
        {groups.length > 0 ? (
          <>
            <MonthTabs groups={groups} />
            <div className="mt-6 space-y-12">
              {groups.map(group => (
                <WeekSection key={group.isoWeek} group={group} paysId={pays} />
              ))}
            </div>
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
      <BottomNav paysId={pays} />
    </>
  )
}
