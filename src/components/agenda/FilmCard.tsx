import type { Film } from '@/lib/types'
import { formatDuration } from '@/lib/utils'

interface FilmCardProps {
  film: Film & { release_date: string }
}

const GENRE_CLASSES: Record<string, string> = {
  ACTION:       'bg-red-900/60 text-red-200',
  COMÉDIE:      'bg-yellow-900/60 text-yellow-200',
  COMEDIE:      'bg-yellow-900/60 text-yellow-200',
  DRAME:        'bg-blue-900/60 text-blue-200',
  MUSICAL:      'bg-purple-900/60 text-purple-200',
  HORREUR:      'bg-red-950/80 text-red-300',
  THRILLER:     'bg-orange-900/60 text-orange-200',
  ANIMATION:    'bg-emerald-900/60 text-emerald-200',
  DOCUMENTAIRE: 'bg-teal-900/60 text-teal-200',
  SF:           'bg-sky-900/60 text-sky-200',
  SCIENCE:      'bg-sky-900/60 text-sky-200',
}

function genreClass(genre: string): string {
  const key = Object.keys(GENRE_CLASSES).find(k => genre.toUpperCase().includes(k))
  return key ? GENRE_CLASSES[key] : 'bg-chip-bg text-chip-text'
}

export function FilmCard({ film }: FilmCardProps) {
  const hasMeta = film.director || film.studio

  return (
    <div className="flex items-start gap-3 px-3 py-3 bg-surface-card rounded-sm">
      {film.genre && (
        <span className={`shrink-0 mt-0.5 text-[10px] font-body font-semibold px-2 py-0.5 rounded-full leading-tight ${genreClass(film.genre)}`}>
          {film.genre}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display font-semibold text-text text-sm leading-tight truncate">
            {film.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-body text-muted">
            {film.duration_min && <span>{formatDuration(film.duration_min)}</span>}
            {film.projection_fmt && (
              <span className="text-cyan">{film.projection_fmt}</span>
            )}
          </div>
        </div>

        {hasMeta && (
          <p className="mt-0.5 text-[11px] font-body text-muted/80 truncate">
            {film.director && `Dir. ${film.director}`}
            {film.director && film.studio && ' · '}
            {film.studio}
          </p>
        )}
      </div>
    </div>
  )
}
