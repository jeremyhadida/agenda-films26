import Image from 'next/image'
import type { Film } from '@/lib/types'
import { formatDate, formatDuration } from '@/lib/utils'

interface HeroSectionProps {
  film: Film & { release_date: string }
}

export function HeroSection({ film }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
      {film.poster_url ? (
        <Image
          src={film.poster_url}
          alt={film.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="w-full h-full bg-surface-low flex items-center justify-center text-muted text-6xl">
          🎬
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-3">
          {film.genre && (
            <span className="bg-chip-bg text-chip-text rounded-full text-xs px-3 py-1 font-body">
              {film.genre}
            </span>
          )}
          {film.projection_fmt && (
            <span className="text-cyan bg-surface-card/80 rounded-md text-xs px-3 py-1 font-body">
              {film.projection_fmt}
            </span>
          )}
        </div>

        <h1 className="font-display font-bold text-text text-4xl md:text-6xl leading-tight mb-2 tracking-tight">
          {film.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-muted text-sm font-body">
          {film.release_date && <span>Au cinéma à partir du {formatDate(film.release_date)}</span>}
          {film.duration_min && (
            <span>{formatDuration(film.duration_min)}</span>
          )}
          {film.nationality && <span>{film.nationality}</span>}
        </div>

        {film.material_url && (
          <a
            href={film.material_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dim text-surface font-body font-semibold text-sm px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            ↓ Télécharger le matériel disponible
          </a>
        )}
      </div>
    </div>
  )
}
