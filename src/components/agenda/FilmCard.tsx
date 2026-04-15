import Image from 'next/image'
import Link from 'next/link'
import type { Film } from '@/lib/types'
import { formatDuration } from '@/lib/utils'
import { StudioBadge } from './StudioBadge'

interface FilmCardProps {
  film: Film & { release_date: string }
  paysId: string
  variant?: 'desktop' | 'mobile'
}

function getGenreStyle(genre: string): { background: string; color: string } {
  const g = genre.toUpperCase()
  if (g.includes('ACTION'))                            return { background: 'rgba(185,28,28,0.85)',  color: '#fecaca' }
  if (g.includes('COMÉDIE') || g.includes('COMEDIE'))  return { background: 'rgba(146,64,14,0.85)',  color: '#fef08a' }
  if (g.includes('DRAME'))                             return { background: 'rgba(30,58,138,0.85)',  color: '#bfdbfe' }
  if (g.includes('MUSICAL'))                           return { background: 'rgba(88,28,135,0.85)',  color: '#e9d5ff' }
  if (g.includes('HORREUR'))                           return { background: 'rgba(127,0,0,0.85)',    color: '#fca5a5' }
  if (g.includes('THRILLER'))                          return { background: 'rgba(154,52,18,0.85)',  color: '#fed7aa' }
  if (g.includes('ANIMATION'))                         return { background: 'rgba(6,78,59,0.85)',    color: '#a7f3d0' }
  if (g.includes('DOCUMENTAIRE'))                      return { background: 'rgba(19,78,74,0.85)',   color: '#99f6e4' }
  if (g.includes('SF') || g.includes('SCIENCE'))       return { background: 'rgba(12,74,110,0.85)',  color: '#bae6fd' }
  return { background: '#544601', color: '#c9b468' }
}

export function FilmCard({ film, paysId, variant = 'desktop' }: FilmCardProps) {
  const href = `/${paysId}/films/${film.id}`

  const techTags = [film.projection_fmt, film.audio_mix].filter(Boolean)
  const isTechnical = (tag: string) =>
    ['IMAX', '3D', '4DX', 'Dolby Atmos', 'ATMOS'].some(t => tag.toUpperCase().includes(t.toUpperCase()))

  if (variant === 'mobile') {
    return (
      <Link href={href} className="flex gap-3 p-3 bg-surface-card rounded-lg hover:scale-[1.02] transition-transform">
        <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 bg-surface-low relative">
          {film.poster_url ? (
            <Image src={film.poster_url} alt={film.title} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-2xl">🎬</div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-display font-semibold text-text text-sm leading-tight mb-1 truncate">
            {film.title}
          </h3>
          {film.director && (
            <p className="text-muted text-xs font-body mb-2 truncate">{film.director}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {film.genre && (
              <span className="bg-chip-bg text-chip-text rounded-full text-xs px-2 py-0.5 font-body">
                {film.genre}
              </span>
            )}
            {film.duration_min && (
              <span className="bg-surface-low text-muted rounded-md text-xs px-2 py-0.5 font-body">
                {formatDuration(film.duration_min)}
              </span>
            )}
            {techTags.map(tag => (
              <span key={tag} className={`rounded-md text-xs px-2 py-0.5 font-body ${isTechnical(tag!) ? 'text-cyan bg-surface-low' : 'bg-surface-low text-muted'}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  // Desktop variant (vertical)
  const genreStyle = film.genre ? getGenreStyle(film.genre) : null

  return (
    <Link href={href} className="bg-surface-card rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 group block">
      {/* Poster : aspect-2/3 garantit le ratio affiche sans crop */}
      <div className="relative aspect-2/3 overflow-hidden bg-surface-low">
        {film.poster_url ? (
          <Image src={film.poster_url} alt={film.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-4xl">🎬</div>
        )}

        {/* Tag genre — haut gauche, couleur dynamique par genre */}
        {genreStyle && film.genre && (
          <span
            className="absolute top-2 left-2 text-[10px] font-body font-semibold px-2 py-0.5 rounded-full leading-tight"
            style={{ background: genreStyle.background, color: genreStyle.color }}
          >
            {film.genre}
          </span>
        )}

        {/* Format projection — haut droit */}
        {film.projection_fmt && (
          <span className="absolute top-2 right-2 bg-surface-card/80 text-cyan text-xs px-2 py-0.5 rounded-md font-body">
            {film.projection_fmt}
          </span>
        )}

        {/* Durée — bas droit */}
        {film.duration_min && (
          <span className="absolute bottom-2 right-2 bg-surface/75 text-muted text-[10px] font-body px-1.5 py-0.5 rounded-md">
            {formatDuration(film.duration_min)}
          </span>
        )}
      </div>

      {/* Infos sous le poster */}
      <div className="p-3 flex flex-col gap-0.5">
        <h3 className="font-display font-semibold text-text text-sm leading-tight mb-0.5 line-clamp-2">
          {film.title}
        </h3>
        {film.director && (
          <p className="text-muted text-xs font-body leading-snug truncate">
            Dir. {film.director}
          </p>
        )}
        {film.cast_main && (
          <p className="text-muted text-xs font-body leading-snug line-clamp-1">
            {film.cast_main}
          </p>
        )}
        {/* Logo studio — charge /public/logos/{slug}.png, fallback texte */}
        {film.studio && <StudioBadge studio={film.studio} />}
      </div>
    </Link>
  )
}
