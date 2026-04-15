import Link from 'next/link'
import type { Country } from '@/lib/types'

interface HeaderProps {
  countries: Country[]
  currentCountryId?: string
}

export function Header({ countries, currentCountryId }: HeaderProps) {
  const current = countries.find(c => c.id === currentCountryId)

  return (
    <header className="sticky top-0 z-50 bg-surface-low/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-gold text-lg tracking-tight">
          FILMS 26
        </Link>

        <div className="flex items-center gap-6">
          {/* Lien Mouvements — desktop uniquement */}
          {currentCountryId && (
            <Link
              href={`/${currentCountryId}/mouvements`}
              className="hidden md:block text-sm font-body text-muted hover:text-text transition-colors"
            >
              Mouvements
            </Link>
          )}

          {current && (
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm font-body">{current.name}</span>
              <Link
                href="/"
                className="text-xs text-gold-dim hover:text-gold font-body transition-colors"
              >
                Changer ▾
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
