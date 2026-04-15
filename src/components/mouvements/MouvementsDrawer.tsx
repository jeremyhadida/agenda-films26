'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { FilmReleaseEvent, Film } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface MouvementsDrawerProps {
  isOpen: boolean
  onClose: () => void
  events: (FilmReleaseEvent & { film: Film })[]
  paysId: string
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  added:        { label: 'Nouvelle sortie',     color: 'text-cyan' },
  date_changed: { label: 'Date modifiée',        color: 'text-gold' },
  removed:      { label: 'Retiré du programme', color: 'text-muted' },
}

export function MouvementsDrawer({ isOpen, onClose, events, paysId }: MouvementsDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-surface/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-low rounded-t-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '80dvh' }}
      >
        {/* Handle + header */}
        <div className="px-4 pt-3 pb-2 border-b border-surface-card">
          <div className="w-10 h-1 bg-surface-card rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-text text-base">Mouvements récents</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors p-1"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable event list */}
        <div className="overflow-y-auto pb-24" style={{ maxHeight: 'calc(80dvh - 64px)' }}>
          {events.length === 0 ? (
            <p className="text-muted text-sm font-body text-center py-10">
              Aucun mouvement récent.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-surface-card">
              {events.map(event => {
                const meta = EVENT_LABELS[event.event_type] ?? EVENT_LABELS.added
                return (
                  <Link
                    key={event.id}
                    href={`/${paysId}/films/${event.film_id}`}
                    onClick={onClose}
                    className="flex gap-3 px-4 py-3 hover:bg-surface-card/40 transition-colors"
                  >
                    <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 bg-surface relative">
                      {event.film?.poster_url ? (
                        <Image
                          src={event.film.poster_url}
                          alt={event.film.title ?? ''}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-sm">🎬</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <span className={`text-[10px] font-body font-semibold uppercase tracking-wide ${meta.color}`}>
                        {meta.label}
                      </span>
                      <p className="font-display font-semibold text-text text-xs leading-snug truncate mt-0.5">
                        {event.film?.title ?? event.film_id}
                      </p>
                      <p className="text-muted text-[10px] font-body mt-0.5">
                        {event.event_type === 'added' && event.new_date && formatDate(event.new_date)}
                        {event.event_type === 'date_changed' && event.old_date && event.new_date &&
                          `${formatDate(event.old_date)} → ${formatDate(event.new_date)}`}
                        {event.event_type === 'removed' && event.old_date &&
                          `Était prévu le ${formatDate(event.old_date)}`}
                      </p>
                    </div>
                    <span className="text-muted text-[10px] font-body self-start pt-1 shrink-0">
                      {formatDate(event.occurred_at.split('T')[0])}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Lien vers la page complète */}
          <div className="px-4 py-4">
            <Link
              href={`/${paysId}/mouvements`}
              onClick={onClose}
              className="block w-full text-center py-2.5 rounded-lg border border-gold/30 text-gold text-sm font-body font-semibold hover:bg-gold/10 transition-colors"
            >
              Voir tous les mouvements →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
