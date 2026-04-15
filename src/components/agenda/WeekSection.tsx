import type { WeekGroup } from '@/lib/types'
import { formatWeekDateRange } from '@/lib/utils'
import { FilmCard } from './FilmCard'

interface WeekSectionProps {
  group: WeekGroup
  paysId: string
}

export function WeekSection({ group, paysId }: WeekSectionProps) {
  return (
    <section id={`week-${group.startDate}`} className="scroll-mt-28">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          {/* Numéro de semaine — petit, muted */}
          <span className="font-body text-muted text-[10px] tracking-widest uppercase">
            Semaine {group.isoWeek}
          </span>
          {/* Plage de dates — bold, gold */}
          <h2 className="font-display font-bold text-gold text-base leading-tight">
            {formatWeekDateRange(group.startDate)}
          </h2>
        </div>
        <span className="bg-surface-card text-muted text-xs font-body px-3 py-1 rounded-full shrink-0">
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
