import type { Film } from '@/lib/types'

interface CastGridProps {
  film: Film
}

export function CastGrid({ film }: CastGridProps) {
  if (!film.cast_main && !film.director) return null

  const cast = film.cast_main
    ? film.cast_main.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div>
      {film.director && (
        <div className="mb-4">
          <span className="font-body text-xs uppercase tracking-widest text-muted">Réalisateur</span>
          <p className="font-display font-semibold text-text mt-1">{film.director}</p>
        </div>
      )}
      {cast.length > 0 && (
        <div>
          <span className="font-body text-xs uppercase tracking-widest text-muted">Avec</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {cast.map(name => (
              <span key={name} className="bg-surface-card text-text text-sm font-body px-3 py-1.5 rounded-lg">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
