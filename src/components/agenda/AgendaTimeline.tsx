'use client'

import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import type { Film, FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { formatDuration, formatDateShort, formatDate, getIsoWeek, formatMonthFull } from '@/lib/utils'
import { StudioBadge } from './StudioBadge'

gsap.registerPlugin(ScrollTrigger)

function formatDayShort(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

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

// ── Bannière mouvement card ──
const BANNER_EVENT_STYLES: Record<string, { text: string; bg: string }> = {
  added:        { text: 'text-emerald-400', bg: 'bg-emerald-500/8' },
  date_changed: { text: 'text-gold',        bg: 'bg-gold/8'        },
  removed:      { text: 'text-red-400',     bg: 'bg-red-500/8'    },
}

function MovementBannerCard({ event }: { event: FilmReleaseEvent & { film?: Film } }) {
  const style = BANNER_EVENT_STYLES[event.event_type] ?? BANNER_EVENT_STYLES.added

  function handleClick() {
    document.getElementById(`film-${event.film_id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <button
      onClick={handleClick}
      className={`flex gap-3 p-3 rounded-lg w-full text-left cursor-pointer hover:scale-[1.01] transition-transform ${style.bg}`}
    >
      <div className="w-8 h-11 rounded overflow-hidden shrink-0 bg-surface-low relative">
        {event.film?.poster_url ? (
          <Image src={event.film.poster_url} alt="" fill className="object-cover" sizes="32px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">🎬</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-text text-xs truncate mb-0.5">
          {event.film?.title ?? event.film_id}
        </p>
        <div className="text-[10px] font-body text-muted whitespace-nowrap overflow-hidden">
          {event.event_type === 'added' && event.new_date && (
            <span>Sortie : <span className="text-text">{formatDate(event.new_date)}</span></span>
          )}
          {event.event_type === 'date_changed' && event.old_date && event.new_date && (
            <>
              <span className="line-through opacity-60">{formatDate(event.old_date)}</span>
              <span> → </span>
              <span className="text-text">{formatDate(event.new_date)}</span>
            </>
          )}
          {event.event_type === 'removed' && event.old_date && (
            <span>Était prévu le <span className="text-text">{formatDate(event.old_date)}</span></span>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Film card ──
interface FilmTimelineCardProps {
  film: Film & { release_date: string }
  event: FilmReleaseEvent | undefined
  side: 'left' | 'right'
}

function MetaChips({ film, genre, isLeft }: { film: Film; genre: string | undefined; isLeft: boolean }) {
  if (!genre && !film.duration_min && !film.projection_fmt) return null
  return (
    <div className={`flex items-center gap-1 flex-wrap ${isLeft ? 'justify-end' : 'justify-start'}`}>
      {genre && (
        <span className={`rounded-sm px-1.5 py-px text-[7px] font-body font-bold leading-none ${genreClass(genre)}`}>
          {genre}
        </span>
      )}
      {film.duration_min && (
        <span className="text-[8.5px] text-cyan/80 font-body font-medium leading-none">
          {formatDuration(film.duration_min)}
        </span>
      )}
      {film.projection_fmt && (
        <span className="text-[8.5px] text-muted/50 font-body leading-none">
          {film.projection_fmt}
        </span>
      )}
    </div>
  )
}

function FilmTimelineCard({ film, event, side }: FilmTimelineCardProps) {
  const genre  = film.genre?.split(',')[0]?.trim()
  const isLeft = side === 'left'

  return (
    <div
      id={`film-${film.id}`}
      className={`tl-card-${side} relative min-w-0`}
      style={isLeft ? { marginRight: '0.75rem', opacity: 0 } : { marginLeft: '0.75rem', opacity: 0 }}
    >
      {/* Bordure gradient animée (conic-gradient aurora ou couleur unie) */}
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

          {/* Desktop : titre + méta sur la même ligne */}
          <div className={`hidden md:flex items-start gap-2 ${isLeft ? 'flex-row-reverse' : ''}`}>
            <p className="font-display font-bold text-text text-[11px] leading-snug flex-1 min-w-0">
              {film.title}
            </p>
            <div className={`shrink-0 flex flex-col gap-0.5 pt-px ${isLeft ? 'items-end' : 'items-start'}`}>
              <MetaChips film={film} genre={genre} isLeft={isLeft} />
            </div>
          </div>

          {/* Mobile : titre seul */}
          <p className="md:hidden font-display font-bold text-text text-[11px] leading-snug line-clamp-2 min-h-[2rem]">
            {film.title}
          </p>

          {/* Réalisateur */}
          {film.director && (
            <p className="text-[10px] font-body text-muted/75 mt-1 truncate">
              {film.director}
            </p>
          )}

          {/* Casting */}
          {film.cast_main && (
            <p className="text-[9.5px] font-body text-muted/55 mt-0.5 truncate">
              {film.cast_main}
            </p>
          )}

          {/* Mobile : méta row */}
          <div className={`md:hidden mt-1.5 ${isLeft ? '' : ''}`}>
            <MetaChips film={film} genre={genre} isLeft={isLeft} />
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
  paysId: string
}

export function AgendaTimeline({ groups, events, paysId }: AgendaTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Dernier jour de modification (granularité jour, heure ignorée)
  const latestDay = events
    .filter(e => e.visible)
    .map(e => e.occurred_at.slice(0, 10))
    .sort()
    .reverse()[0] ?? null

  const latestDayEvents = latestDay
    ? events.filter(e => e.visible && e.occurred_at.slice(0, 10) === latestDay)
    : []

  // Un seul événement par film (le plus récent du jour), tous types confondus
  const latestByFilm = new Map<string, FilmReleaseEvent>()
  latestDayEvents
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .forEach(e => { if (!latestByFilm.has(e.film_id)) latestByFilm.set(e.film_id, e) })

  // eventMap pour les badges / bordures (removed exclus)
  const eventMap = new Map<string, FilmReleaseEvent>()
  latestByFilm.forEach((e, filmId) => {
    if (e.event_type !== 'removed') eventMap.set(filmId, e)
  })

  // Données de la bannière — triées par type (added → date_changed → removed)
  const TYPE_ORDER_BANNER: Record<string, number> = { added: 0, date_changed: 1, removed: 2 }
  const uniqueLatestEvents = Array.from(latestByFilm.values())
  const sortedBannerEvents = [...uniqueLatestEvents].sort(
    (a, b) => (TYPE_ORDER_BANNER[a.event_type] ?? 9) - (TYPE_ORDER_BANNER[b.event_type] ?? 9)
  )
  const hasBanner = uniqueLatestEvents.length > 0

  const BANNER_SECTIONS = [
    { key: 'added' as const,        label: 'Ajouts',      dot: 'bg-emerald-500', text: 'text-emerald-400' },
    { key: 'date_changed' as const, label: 'Modif',       dot: 'bg-gold',        text: 'text-gold'        },
    { key: 'removed' as const,      label: 'Annulations', dot: 'bg-red-500',     text: 'text-red-400'     },
  ] as const
  const activeSections = BANNER_SECTIONS
    .map(s => ({ ...s, events: sortedBannerEvents.filter(e => e.event_type === s.key) }))
    .filter(s => s.events.length > 0)

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentWeek = getIsoWeek(todayStr)

  // Scroll automatique vers la semaine courante (ou la prochaine disponible)
  useEffect(() => {
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dow = todayUTC.getUTCDay() || 7
    const monday = new Date(todayUTC)
    monday.setUTCDate(todayUTC.getUTCDate() - dow + 1)
    const mondayStr = monday.toISOString().split('T')[0]

    const target =
      groups.find(g => g.startDate === mondayStr)?.startDate ??
      groups.find(g => g.startDate >= mondayStr)?.startDate ??
      groups[groups.length - 1]?.startDate

    if (target) {
      document.getElementById(`week-${target}`)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [])

  useGSAP(() => {
    const container = containerRef.current
    if (!container) return

    // Axe central
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

    // Nœuds semaine
    container.querySelectorAll<HTMLElement>('.tl-week-node').forEach(node => {
      gsap.set(node, { opacity: 0, y: 8 })
      ScrollTrigger.create({
        trigger: node,
        start: 'top 88%',
        onEnter:     () => gsap.to(node, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }),
        onLeaveBack: () => gsap.to(node, { opacity: 0, y: 8, duration: 0.15 }),
      })
    })

    // Lignes films
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
    <div ref={containerRef} className="relative mt-4 pb-16 overflow-x-hidden">

      {/* Bannière derniers mouvements */}
      {hasBanner && latestDay && (
        <div className="mb-6 mx-2">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="font-display font-bold text-text text-[11px] tracking-wide">
              Derniers Mouvements
            </span>
            <span className="text-muted font-body text-[10px]">({formatDayShort(latestDay)})</span>
          </div>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {activeSections.map((section, idx) => (
              <div
                key={section.key}
                className={`flex items-start gap-2 shrink-0 ${idx > 0 ? 'border-l border-[#2a4a7a]/50 pl-4 ml-4' : ''}`}
              >
                {/* Label de section vertical */}
                <div className="flex flex-col items-center gap-1 pt-3 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${section.dot}`} />
                  <span
                    className={`text-[8.5px] font-bold uppercase tracking-wider ${section.text}`}
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {section.label}
                  </span>
                </div>
                {/* Cards */}
                <div className="flex gap-2">
                  {section.events.map(event => (
                    <div key={event.id} className="w-44 shrink-0">
                      <MovementBannerCard event={event as FilmReleaseEvent & { film?: Film }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

        // Paires gauche / droite
        const rows: { left: typeof films[0]; right: typeof films[0] | null }[] = []
        for (let j = 0; j < films.length; j += 2) {
          rows.push({ left: films[j], right: films[j + 1] ?? null })
        }

        return (
          <div key={group.isoWeek} id={`week-${group.startDate}`} className="scroll-mt-28">
            {monthSeparator}

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
