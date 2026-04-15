import Link from 'next/link'
import { getActiveCountries } from '@/lib/queries'
import type { Country } from '@/lib/types'

const REGIONS: Record<string, string> = {
  'Maghreb': 'Maghreb',
  'Ouest XOF': 'Afrique de l\'Ouest',
  'Centrale XAF': 'Afrique Centrale',
  'Autres': 'Autres',
}

export const dynamic = 'force-static'

export default async function HomePage() {
  const countries = await getActiveCountries()

  const byRegion = countries.reduce<Record<string, Country[]>>((acc, c) => {
    const region = c.region ?? 'Autres'
    if (!acc[region]) acc[region] = []
    acc[region].push(c)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-5xl font-bold text-gold mb-2 tracking-tight">
          FILMS 26
        </h1>
        <p className="font-body text-muted mb-12">
          Agenda des sorties cinéma en Afrique Francophone
        </p>

        <div className="space-y-10">
          {Object.entries(byRegion).map(([region, pays]) => (
            <div key={region}>
              <h2 className="font-body text-xs uppercase tracking-widest text-muted mb-4">
                {REGIONS[region] ?? region}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pays.map((country) => (
                  <Link
                    key={country.id}
                    href={`/${country.id}`}
                    className="bg-surface-card rounded-lg px-4 py-3 hover:scale-[1.02] transition-transform"
                  >
                    <span className="font-display font-semibold text-text">
                      {country.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
