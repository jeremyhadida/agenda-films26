import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getActiveCountries, getAgendaByCountry, getMovementsByCountry } from '@/lib/queries'
import { groupFilmsByWeek } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { MonthTabs } from '@/components/agenda/MonthTabs'
import { WeekSection } from '@/components/agenda/WeekSection'

export const revalidate = 3600

const FR_MONTHS_FULL = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return FR_MONTHS_FULL[d.getUTCMonth()]
}

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

  const groups = groupFilmsByWeek(films)

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="max-w-7xl mx-auto px-4 pb-24 md:pb-8">
        {groups.length > 0 ? (
          <>
            <MonthTabs groups={groups} />
            <div className="mt-6 space-y-12">
              {groups.map((group, i) => {
                const showMonth =
                  i === 0 || getMonthKey(groups[i - 1].startDate) !== getMonthKey(group.startDate)

                return (
                  <div key={group.isoWeek}>
                    {showMonth && (
                      <div className="mb-8">
                        <h2 className="font-display font-bold text-text text-2xl md:text-3xl tracking-wide">
                          {getMonthLabel(group.startDate)}
                        </h2>
                        <div className="mt-1.5 h-px bg-gold/20 w-20" />
                      </div>
                    )}
                    <WeekSection group={group} paysId={pays} />
                  </div>
                )
              })}
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
      <MobileNav paysId={pays} events={events.slice(0, 15)} />
    </>
  )
}
