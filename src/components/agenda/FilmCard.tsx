import Image from 'next/image'
import Link from 'next/link'
import type { Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface FilmCardProps {
  film: Film & { release_date: string }
  paysId: string
  variant?: 'desktop' | 'mobile'
}

export function FilmCard({ film, paysId, variant = 'desktop' }: FilmCardProps) {
  const href = `/${paysId}/films/${film.id}`

  const techTags = [film.projection_fmt, film.audio_mix].filter(Boolean)
  const isTechnical = (tag: string) =>
    ['IMAX', '3D', '4DX', 'Dolby Atmos', 'ATMOS'].some(t => tag.toUpperCase().includes(t.toUpperCase()))

  if (variant === 'mobile') {
    return (
      <Link href={href} className="flex gap-3 p-3 bg-surface-card rounded-lg hover:scale-[1.02] transition-transform">
        <div className="w-16 h-24 rounded-md overflow-hidden flex-shrink-0 bg-surface-low relative">
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
                {Math.floor(film.duration_min / 60)}h{String(film.duration_min % 60).padStart(2, '0')}
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
  return (
    <Link href={href} className="bg-surface-card rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 group block">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-low">
        {film.poster_url ? (
          <Image src={film.poster_url} alt={film.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-4xl">🎬</div>
        )}
        {film.projection_fmt && (
          <span className="absolute top-2 right-2 bg-surface-card/80 text-cyan text-xs px-2 py-0.5 rounded-md font-body">
            {film.projection_fmt}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display font-semibold text-text text-sm leading-tight mb-1 line-clamp-2">
          {film.title}
        </h3>
        <p className="text-muted text-xs font-body mb-2">{formatDate(film.release_date)}</p>
        <div className="flex flex-wrap gap-1">
          {film.genre && (
            <span className="bg-chip-bg text-chip-text rounded-full text-xs px-2 py-0.5 font-body">
              {film.genre}
            </span>
          )}
          {film.duration_min && (
            <span className="bg-surface-low text-muted rounded-md text-xs px-2 py-0.5 font-body">
              {Math.floor(film.duration_min / 60)}h{String(film.duration_min % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
