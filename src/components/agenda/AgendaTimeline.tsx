'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Film, FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { formatDuration, formatDateShort, getIsoWeek, formatMonthFull } from '@/lib/utils'
import { StudioBadge } from './StudioBadge'

gsap.registerPlugin(ScrollTrigger)

// ── Genre classes ──
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

function borderClass(event: FilmReleaseEvent | undefined): string {
  if (event?.event_type === 'added')        return 'tl-border-added'
  if (event?.event_type === 'date_changed') return 'tl-border-date-changed'
  return 'tl-border-aurora'
}

function dotColorForRow(
  leftEvent: FilmReleaseEvent | undefined,
  rightEvent: FilmReleaseEvent | undefined,
  isoWeek: number,
  isCurrent: boolean
): string {
  if (isCurrent) return 'bg-gold border-gold shadow-[0_0_8px_rgba(255,215,0,0.45)]'
  const added       = leftEvent?.event_type === 'added'        || rightEvent?.event_type === 'added'
  const dateChanged = leftEvent?.event_type === 'date_changed' || rightEvent?.event_type === 'date_changed'
  if (added)       return 'bg-[#00ff88]/30 border-[#00ff88]/60 shadow-[0_0_6px_rgba(0,255,136,0.25)]'
  if (dateChanged) return 'bg-gold/30 border-gold/60 shadow-[0_0_6px_rgba(255,215,0,0.25)]'
  return isoWeek % 2 === 0 ? 'bg-cyan/35 border-cyan/45' : 'bg-muted/35 border-muted/45'
}

// ── Film card ──
interface FilmTimelineCardProps {
  film: Film & { release_date: string }
  event: FilmReleaseEvent | undefined
  side: 'left' | 'right'
}

function FilmTimelineCard({ film, event, side }: FilmTimelineCardProps) {
  const genre  = film.genre?.split(',')[0]?.trim()
  const isLeft = side === 'left'

  return (
    <div
      className={`tl-card-${side} relative min-w-0`}
      style={isLeft ? { marginRight: '0.75rem', opacity: 0 } : { marginLeft: '0.75rem', opacity: 0 }}
    >
      {/* Desktop — métadonnées hors de la carte, sur la ligne visuelle du titre */}
      {(genre || film.duration_min || film.projection_fmt) && (
        <div className={`hidden md:flex items-center gap-2 mb-1 ${isLeft ? 'justify-end' : 'justify-start'}`}>
          {genre && (
            <span className={`rounded-sm px-1.5 py-px text-[7px] font-body font-bold ${genreClass(genre)}`}>
              {genre}
            </span>
          )}
          {film.duration_min && (
            <span className="text-[8.5px] text-cyan font-body font-medium">
              {formatDuration(film.duration_min)}
            </span>
          )}
          {film.projection_fmt && (
            <span className="text-[8.5px] text-muted/50 font-body">
              {film.projection_fmt}
            </span>
          )}
        </div>
      )}

      {/* Wrapper avec bordure gradient animée (conic-gradient ou couleur unie) */}
      <div
        className={`tl-card-border-wrap relative rounded-lg ${borderClass(event)}`}
        style={{ padding: '1.5px' }}
      >
        {/* Pastille événement — angle haut extérieur à la ligne centrale */}
        {event && (
          <div
            className={`absolute -top-2.5 z-20 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black leading-none ${
              isLeft ? '-left-2.5' : '-right-2.5'
            } ${
              event.event_type === 'added'
                ? 'bg-[#021232] border-2 border-[#00ff88] text-[#00ff88]'
                : 'bg-[#021232] border-2 border-gold text-gold'
            }`}
            aria-label={event.event_type === 'added' ? 'Nouvelle sortie' : 'Date modifiée'}
          >
            {event.event_type === 'added' ? '+' : '↕'}
          </div>
        )}

        {/* Contenu */}
        <div className={`bg-surface-card rounded-[14px] p-2.5 ${isLeft ? 'text-right' : 'text-left'}`}>

          {/* Mobile — genre chip dans la carte */}
          {genre && (
            <span className={`md:hidden inline-block rounded-sm px-1.5 py-px text-[6.5px] font-body font-bold mb-1.5 ${genreClass(genre)}`}>
              {genre}
            </span>
          )}

          {/* Titre — toujours 2 lignes minimum */}
          <p className="font-display font-bold text-text text-[10.5px] leading-snug line-clamp-2 min-h-[2.625rem]">
            {film.title}
          </p>

          {/* Réalisateur */}
          {film.director && (
            <p className="text-[9.5px] font-body text-muted/80 mt-0.5 truncate">
              Dir. {film.director}
            </p>
          )}

          {/* Casting */}
          {film.cast_main && (
            <p className="text-[9px] font-body text-muted/60 mt-0.5 truncate">
              {film.cast_main}
            </p>
          )}

          {/* Durée + format — mobile uniquement */}
          <div className={`md:hidden flex gap-1 mt-1.5 text-[7.5px] font-body text-cyan ${
            isLeft ? 'justify-end' : 'justify-start'
          }`}>
            {film.duration_min && <span>{formatDuration(film.duration_min)}</span>}
            {film.projection_fmt && <span>· {film.projection_fmt}</span>}
          </div>

          {/* Ayant-droit */}
          {film.studio && (
            <div className={`mt-1.5 ${isLeft ? 'flex justify-end' : 'flex justify-start'}`}>
              <StudioBadge studio={film.studio} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ──
interface AgendaTimelineProps {
  groups: WeekGroup[]
  events: FilmReleaseEvent[]
}

export function AgendaTimeline({ groups, events }: AgendaTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const eventMap = new Map<string, FilmReleaseEvent>()
  events
    .filter(e => e.visible && e.event_type !== 'removed')
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .forEach(e => { if (!eventMap.has(e.film_id)) eventMap.set(e.film_id, e) })

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentWeek = getIsoWeek(todayStr)

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    // Axe central — se dessine au scroll
    const axis = container.querySelector<HTMLElement>('.tl-axis')
    if (axis) {
      gsap.set(axis, { scaleY: 0, transformOrigin: 'top center' })
      ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        end: 'bottom bottom',
        onUpdate: self => { gsap.set(axis, { scaleY: self.progress }) },
      })
    }

    // Nœuds semaine — fade up
    container.querySelectorAll<HTMLElement>('.tl-week-node').forEach(node => {
      gsap.set(node, { opacity: 0, y: 8 })
      ScrollTrigger.create({
        trigger: node,
        start: 'top 88%',
        onEnter:     () => gsap.to(node, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }),
        onLeaveBack: () => gsap.to(node, { opacity: 0, y: 8, duration: 0.15 }),
      })
    })

    // Lignes de films — vol synchronisé : carte + contour apparaissent ensemble
    container.querySelectorAll<HTMLElement>('.tl-film-row').forEach(row => {
      const leftCard  = row.querySelector<HTMLElement>('.tl-card-left')
      const rightCard = row.querySelector<HTMLElement>('.tl-card-right')
      const dot       = row.querySelector<HTMLElement>('.tl-dot')

      if (leftCard)  gsap.set(leftCard,  { opacity: 0, x: -28 })
      if (rightCard) gsap.set(rightCard, { opacity: 0, x: 28 })
      if (dot)       gsap.set(dot,       { scale: 0, opacity: 0 })

      ScrollTrigger.create({
        trigger: row,
        start: 'top 82%',
        onEnter: () => {
          if (dot)       gsap.to(dot,       { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(2)' })
          if (leftCard)  gsap.to(leftCard,  { opacity: 1, x: 0, duration: 0.35, delay: 0.05, ease: 'power3.out' })
          if (rightCard) gsap.to(rightCard, { opacity: 1, x: 0, duration: 0.35, delay: 0.05, ease: 'power3.out' })
        },
        onLeaveBack: () => {
          if (dot)       gsap.to(dot,       { scale: 0, opacity: 0, duration: 0.15 })
          if (leftCard)  gsap.to(leftCard,  { opacity: 0, x: -28, duration: 0.18, ease: 'power2.in' })
          if (rightCard) gsap.to(rightCard, { opacity: 0, x: 28,  duration: 0.18, ease: 'power2.in' })
        },
      })
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative mt-4 pb-16">
      {/* Axe vertical */}
      <div
        className="tl-axis pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1e3260] to-transparent"
        aria-hidden="true"
      />

      {groups.map((group, i) => {
        const isCurrent = group.isoWeek === currentWeek
        const films = group.films

        const prevGroup = i > 0 ? groups[i - 1] : null
        const isNewMonth = !prevGroup ||
          new Date(group.startDate + 'T00:00:00Z').getUTCMonth() !==
          new Date(prevGroup.startDate + 'T00:00:00Z').getUTCMonth()

        const monthSeparator = isNewMonth && (
          <div className="flex items-center gap-3 pt-10 pb-4 px-4">
            <span className="font-display font-bold text-text text-sm tracking-[0.2em] uppercase shrink-0">
              {formatMonthFull(group.startDate)}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/60 to-transparent" />
          </div>
        )

        // Semaine vide
        if (films.length === 0) {
          return (
            <div key={`${group.isoWeek}-empty`} id={`week-${group.startDate}`} className="scroll-mt-28">
              {monthSeparator}
              <div className="tl-week-node flex items-center gap-3 py-3 relative z-10 px-4">
                <div className="flex-1 h-px bg-[#2a4a7a]/30" />
                <div className="rounded-full px-3 py-0.5 text-[8.5px] font-body tracking-wider border border-[#2a3a5a]/20 text-muted/25 whitespace-nowrap">
                  S{group.isoWeek} · {formatDateShort(group.startDate)}
                </div>
                <div className="flex-1 h-px bg-[#2a4a7a]/30" />
              </div>
            </div>
          )
        }

        // Paires gauche/droite
        const rows: { left: typeof films[0]; right: typeof films[0] | null }[] = []
        for (let j = 0; j < films.length; j += 2) {
          rows.push({ left: films[j], right: films[j + 1] ?? null })
        }

        return (
          <div key={group.isoWeek} id={`week-${group.startDate}`} className="scroll-mt-28">
            {monthSeparator}

            {/* Séparateur semaine — visible et contrasté */}
            <div className="tl-week-node flex items-center gap-3 py-4 relative z-10 px-4">
              <div className={`flex-1 h-px ${isCurrent ? 'bg-gold/40' : 'bg-[#2a4a7a]/60'}`} />
              <div className={`rounded-full px-4 py-1.5 text-[11px] font-body font-bold tracking-wider whitespace-nowrap ${
                isCurrent
                  ? 'bg-gold/15 border border-gold/70 text-gold shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                  : 'bg-surface-low border border-[#2a4a7a] text-muted'
              }`}>
                S{group.isoWeek} · {formatDateShort(group.startDate)}
                {isCurrent && (
                  <span className="ml-1.5 text-gold/70 font-normal text-[9.5px]">— en cours</span>
                )}
              </div>
              <div className={`flex-1 h-px ${isCurrent ? 'bg-gold/40' : 'bg-[#2a4a7a]/60'}`} />
            </div>

            {rows.map(({ left, right }, rowIdx) => {
              const leftEvent  = eventMap.get(left.id)
              const rightEvent = right ? eventMap.get(right.id) : undefined

              return (
                <div
                  key={`${group.isoWeek}-${rowIdx}`}
                  className="tl-film-row grid grid-cols-[1fr_16px_1fr] items-center py-1.5 relative z-10 px-2 min-w-0"
                >
                  <FilmTimelineCard film={left} event={leftEvent} side="left" />

                  <div
                    className={`tl-dot w-2.5 h-2.5 rounded-full border-[1.5px] justify-self-center flex-shrink-0 ${
                      dotColorForRow(leftEvent, rightEvent, group.isoWeek, isCurrent)
                    }`}
                  />

                  {right
                    ? <FilmTimelineCard film={right} event={rightEvent} side="right" />
                    : <div />
                  }
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
