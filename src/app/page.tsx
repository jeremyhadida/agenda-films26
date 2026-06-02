import Link from 'next/link'
import { getActiveCountries } from '@/lib/queries'
import { PasswordGate } from '@/components/PasswordGate'
import type { Country } from '@/lib/types'

const REGIONS: Record<string, string> = {
  'Maghreb': 'Maghreb',
  'Ouest XOF': "Afrique de l'Ouest",
  'Centrale XAF': 'Afrique Centrale',
  'Autres': 'Autres',
}

export default async function HomePage() {
  const countries = await getActiveCountries()

  const byRegion = countries.reduce<Record<string, Country[]>>((acc, c) => {
    const region = c.region ?? 'Autres'
    if (!acc[region]) acc[region] = []
    acc[region].push(c)
    return acc
  }, {})

  return (
    <PasswordGate>
      <main className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="font-display text-5xl font-bold text-gold mb-2 tracking-tight">
            FILMS 26
          </h1>
          <p className="font-body text-muted mb-2">
            Agenda des sorties cinéma en Afrique Francophone
          </p>
          <p className="font-body text-[11px] text-gold/50 mb-12 uppercase tracking-widest">
            Accès interne
          </p>

          <div className="space-y-10">
            {Object.entries(byRegion).map(([region, pays]) => (
              <div key={region}>
                <h2 className="font-body text-xs uppercase tracking-widest text-muted mb-3">
                  {REGIONS[region] ?? region}
                </h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e3260]/60">
                      <th className="text-left font-body text-[10px] uppercase tracking-widest text-muted/50 py-2 pr-4 w-full">
                        Pays
                      </th>
                      <th className="font-body text-[10px] uppercase tracking-widest text-muted/50 py-2 px-4 whitespace-nowrap">
                        Prod
                      </th>
                      <th className="font-body text-[10px] uppercase tracking-widest text-gold/50 py-2 pl-4 whitespace-nowrap">
                        Master
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pays.map((country) => (
                      <tr
                        key={country.id}
                        className="border-b border-[#1e3260]/30 hover:bg-surface-low/40 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <span className="font-display font-semibold text-text text-sm">
                            {country.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/${country.id}`}
                            className="font-body text-xs text-muted hover:text-text transition-colors"
                          >
                            → Agenda
                          </Link>
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <Link
                            href={`/master/${country.id}`}
                            className="font-body text-xs text-gold-dim hover:text-gold transition-colors"
                          >
                            → Master
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PasswordGate>
  )
}
