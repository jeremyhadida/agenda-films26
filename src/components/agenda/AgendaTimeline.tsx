'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Film, FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { formatDuration, formatDateShort, getIsoWeek } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

// ── Genre classes (même mapping que FilmCard) ──
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

function dotColorClass(isoWeek: number, isCurrent: boolean): string {
  if (isCurrent) return 'bg-gold border-gold shadow-[0_0_8px_rgba(255,215,0,0.45)]'
  return isoWeek % 2 === 0
    ? 'bg-cyan/20 border-cyan/30'
    : 'bg-muted/20 border-muted/30'
}

// ── Film card within the timeline ──
interface FilmTimelineCardProps {
  film: Film & { release_date: string }
  event: FilmReleaseEvent | undefined
  side: 'left' | 'right'
}

function FilmTimelineCard({ film, event, side }: FilmTimelineCardProps) {
  const genre = film.genre?.split(',')[0]?.trim()

  return (
    <div
      className={`tl-card-${side} relative bg-surface-card border border-[#2a3a5a] rounded-lg p-2.5 ${
        side === 'left' ? 'mr-3 text-right' : 'ml-3 text-left'
      }`}
    >
      {/* Event badge */}
      {event && (
        <span
          className={`absolute top-1.5 ${side === 'left' ? 'left-1.5' : 'right-1.5'} text-[9px] leading-none ${
            event.event_type === 'added' ? 'text-gold' : 'text-cyan'
          }`}
          title={event.event_type === 'added' ? 'Nouvelle sortie' : 'Date modifiée'}
          aria-label={event.event_type === 'added' ? 'Nouvelle sortie' : 'Date modifiée'}
        >
          {event.event_type === 'added' ? '✦' : '↕'}
        </span>
      )}

      {/* Genre chip */}
      {genre && (
        <span className={`inline-block rounded-sm px-1.5 py-px text-[6.5px] font-body font-bold mb-1.5 ${genreClass(genre)}`}>
          {genre}
        </span>
      )}

      {/* Title */}
      <p className="font-display font-bold text-text text-[10.5px] leading-snug line-clamp-2">
        {film.title}
      </p>

      {/* Director */}
      {film.director && (
        <p className="text-[8px] font-body text-muted/70 mt-0.5 truncate">
          Dir. {film.director}
        </p>
      )}

      {/* Cast */}
      {film.cast_main && (
        <p className="text-[7.5px] font-body text-muted/55 mt-0.5 truncate">
          {film.cast_main}
        </p>
      )}

      {/* Duration + format */}
      <div className={`flex gap-1 mt-1.5 text-[7.5px] font-body text-cyan ${
        side === 'left' ? 'justify-end' : 'justify-start'
      }`}>
        {film.duration_min && <span>{formatDuration(film.duration_min)}</span>}
        {film.projection_fmt && <span>· {film.projection_fmt}</span>}
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

  // Build lookup: film_id → most recent visible non-removed event
  const eventMap = new Map<string, FilmReleaseEvent>()
  events
    .filter(e => e.visible && e.event_type !== 'removed')
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .forEach(e => { if (!eventMap.has(e.film_id)) eventMap.set(e.film_id, e) })

  // Current ISO week
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentWeek = getIsoWeek(todayStr)

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    // Center axis — draws progressively as user scrolls
    const axis = container.querySelector<HTMLElement>('.tl-axis')
    if (axis) {
      gsap.set(axis, { scaleY: 0, transformOrigin: 'top center' })
      ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        end: 'bottom bottom',
        onUpdate: self => {
          gsap.set(axis, { scaleY: self.progress })
        },
      })
    }

    // Week nodes — fade up
    container.querySelectorAll<HTMLElement>('.tl-week-node').forEach(node => {
      gsap.set(node, { opacity: 0, y: 8 })
      ScrollTrigger.create({
        trigger: node,
        start: 'top 88%',
        onEnter:    () => gsap.to(node, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }),
        onLeaveBack: () => gsap.to(node, { opacity: 0, y: 8, duration: 0.15 }),
      })
    })

    // Film rows — cards fly in from sides
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
          if (leftCard)  gsap.to(leftCard,  { opacity: 1, x: 0, duration: 0.32, delay: 0.05, ease: 'power3.out' })
          if (rightCard) gsap.to(rightCard, { opacity: 1, x: 0, duration: 0.32, delay: 0.05, ease: 'power3.out' })
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
      {/* Vertical axis */}
      <div
        className="tl-axis pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1e3260] to-transparent"
        aria-hidden="true"
      />

      {groups.map(group => {
        const isCurrent = group.isoWeek === currentWeek
        const films = group.films

        // Build pairs: [0,1], [2,3], ...
        const rows: { left: typeof films[0]; right: typeof films[0] | null }[] = []
        for (let i = 0; i < films.length; i += 2) {
          rows.push({ left: films[i], right: films[i + 1] ?? null })
        }

        return (
          <div key={group.isoWeek}>
            {/* Week node */}
            <div className="tl-week-node flex justify-center py-3 relative z-10">
              <div
                className={`border rounded-full px-3 py-1 text-[8.5px] font-body font-bold tracking-wider ${
                  isCurrent
                    ? 'bg-gold/10 border-gold/50 text-gold shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                    : 'bg-surface-low border-[#2a3a5a]/60 text-muted/60'
                }`}
              >
                S{group.isoWeek} · {formatDateShort(group.startDate)}
                {isCurrent && <span className="ml-1.5 opacity-70 font-normal">— en cours</span>}
              </div>
            </div>

            {/* Film rows */}
            {rows.map(({ left, right }, rowIdx) => (
              <div
                key={`${group.isoWeek}-${rowIdx}`}
                className="tl-film-row grid grid-cols-[1fr_16px_1fr] items-center py-1.5 relative z-10 px-2"
              >
                <FilmTimelineCard film={left} event={eventMap.get(left.id)} side="left" />

                <div
                  className={`tl-dot w-2.5 h-2.5 rounded-full border-[1.5px] justify-self-center flex-shrink-0 ${dotColorClass(group.isoWeek, isCurrent)}`}
                />

                {right
                  ? <FilmTimelineCard film={right} event={eventMap.get(right.id)} side="right" />
                  : <div />
                }
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
