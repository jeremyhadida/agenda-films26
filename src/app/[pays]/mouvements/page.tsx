import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveCountries, getMovementsByCountry } from '@/lib/queries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { EventFeed } from '@/components/mouvements/EventFeed'

export const revalidate = 1800

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string }>
}): Promise<Metadata> {
  const { pays } = await params
  const countries = await getActiveCountries()
  const country = countries.find(c => c.id === pays)
  return {
    title: country ? `Mouvements ${country.name} — Films 26` : 'Mouvements — Films 26',
  }
}

export default async function MouvementsPage({
  params,
}: {
  params: Promise<{ pays: string }>
}) {
  const { pays } = await params
  const [countries, events] = await Promise.all([
    getActiveCountries(),
    getMovementsByCountry(pays),
  ])

  const country = countries.find(c => c.id === pays)
  if (!country) notFound()

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-gold text-2xl">Mouvements</h1>
          <Link
            href={`/${pays}`}
            className="text-gold-dim hover:text-gold font-body text-sm transition-colors"
          >
            ← Agenda
          </Link>
        </div>
        <EventFeed events={events} paysId={pays} />
      </main>
      <Footer />
      <BottomNav paysId={pays} />
    </>
  )
}
