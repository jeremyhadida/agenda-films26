import type { WeekGroup } from '@/lib/types'
import { FilmCard } from './FilmCard'

interface WeekSectionProps {
  group: WeekGroup
  paysId: string
}

export function WeekSection({ group, paysId }: WeekSectionProps) {
  return (
    <section id={`week-${group.isoWeek}`} className="scroll-mt-28">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-gold text-sm tracking-wide">
          {group.label}
        </h2>
        <span className="bg-surface-card text-muted text-xs font-body px-3 py-1 rounded-full">
          {group.films.length} {group.films.length > 1 ? 'SORTIES' : 'SORTIE'}
        </span>
      </div>

      {/* Desktop: grille */}
      <div className="hidden md:grid grid-cols-5 lg:grid-cols-5 gap-4">
        {group.films.map(film => (
          <FilmCard key={film.id} film={film} paysId={paysId} variant="desktop" />
        ))}
      </div>

      {/* Mobile: liste */}
      <div className="md:hidden flex flex-col gap-2">
        {group.films.map(film => (
          <FilmCard key={film.id} film={film} paysId={paysId} variant="mobile" />
        ))}
      </div>
    </section>
  )
}
