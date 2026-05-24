import type { WeekGroup } from '@/lib/types'
import { formatWeekDateRange } from '@/lib/utils'
import { FilmCard } from './FilmCard'

interface WeekSectionProps {
  group: WeekGroup
}

export function WeekSection({ group }: WeekSectionProps) {
  return (
    <section id={`week-${group.startDate}`} className="scroll-mt-28">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-muted text-[10px] tracking-widest uppercase">
            Semaine {group.isoWeek}
          </span>
          <h2 className="font-display font-bold text-gold text-base leading-tight">
            {formatWeekDateRange(group.startDate)}
          </h2>
        </div>
        <span className="bg-surface-card text-muted text-xs font-body px-3 py-1 rounded-full shrink-0">
          {group.films.length} {group.films.length > 1 ? 'SORTIES' : 'SORTIE'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {group.films.map(film => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  )
}
