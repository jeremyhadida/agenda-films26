import Link from 'next/link'

interface HeaderProps {
  currentCountryId?: string
  rightSlot?: React.ReactNode
}

export function Header({ currentCountryId, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface-low/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-gold text-lg tracking-tight">
          FILMS 26
        </Link>

        <div className="flex items-center gap-4">
          {currentCountryId && (
            <Link
              href={`/${currentCountryId}/mouvements`}
              className="hidden md:block text-sm font-body text-muted hover:text-text transition-colors"
            >
              Mouvements
            </Link>
          )}
          {rightSlot}
        </div>
      </div>
    </header>
  )
}
