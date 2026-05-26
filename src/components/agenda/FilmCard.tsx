import type { Film } from '@/lib/types'
import { formatDuration } from '@/lib/utils'
import { StudioBadge } from './StudioBadge'

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
  const genres = film.genre
    ? film.genre.split(',').map(g => g.trim()).filter(Boolean)
    : []

  return (
    <div className="flex flex-col bg-surface-card rounded-xl p-4 h-full gap-2.5">
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {genres.map(g => (
            <span
              key={g}
              className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full leading-tight ${genreClass(g)}`}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      <p className="font-display font-bold text-text text-sm leading-tight">
        {film.title}
      </p>

      {film.director && (
        <p className="text-[11px] font-body text-muted leading-snug">
          Dir. {film.director}
        </p>
      )}

      {film.cast_main && (
        <p className="text-[10px] font-body text-muted/70 leading-snug line-clamp-2">
          {film.cast_main}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-surface/40 flex items-end justify-between gap-2">
        {film.studio ? (
          <StudioBadge studio={film.studio} size="md" />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-body text-muted">
          {film.duration_min && <span>{formatDuration(film.duration_min)}</span>}
          {film.projection_fmt && (
            <span className="text-cyan">{film.projection_fmt}</span>
          )}
        </div>
      </div>
    </div>
  )
}
