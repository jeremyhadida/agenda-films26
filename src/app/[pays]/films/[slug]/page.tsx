import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveCountries, getFilmBySlug } from '@/lib/queries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { HeroSection } from '@/components/film/HeroSection'
import { TechInfo } from '@/components/film/TechInfo'
import { CastGrid } from '@/components/film/CastGrid'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string; slug: string }>
}): Promise<Metadata> {
  const { pays, slug } = await params
  const film = await getFilmBySlug(slug, pays)
  return {
    title: film ? `${film.title} — Films 26` : 'Films 26',
    description: film?.synopsis ?? undefined,
  }
}

export default async function FilmPage({
  params,
}: {
  params: Promise<{ pays: string; slug: string }>
}) {
  const { pays, slug } = await params
  const [countries, film] = await Promise.all([
    getActiveCountries(),
    getFilmBySlug(slug, pays),
  ])

  if (!film) notFound()

  return (
    <>
      <Header countries={countries} currentCountryId={pays} />
      <main className="pb-24 md:pb-8">
        <HeroSection film={film} />

        <div className="max-w-7xl mx-auto px-4 mt-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="md:col-span-2 space-y-8">
              {film.synopsis && (
                <div>
                  <h2 className="font-body text-xs uppercase tracking-widest text-muted mb-3">
                    Synopsis
                  </h2>
                  <p className="font-body text-muted leading-relaxed">{film.synopsis}</p>
                </div>
              )}
              <CastGrid film={film} />
            </div>

            {/* Colonne latérale */}
            <div className="space-y-4">
              <TechInfo film={film} />
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/${pays}`}
              className="text-gold-dim hover:text-gold font-body text-sm transition-colors"
            >
              ← Retour à l'agenda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav paysId={pays} />
    </>
  )
}
