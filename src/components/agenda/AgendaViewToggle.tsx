'use client'

import { useState, useMemo } from 'react'
import type { FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { fillWeekGaps } from '@/lib/utils'
import { AgendaTimeline } from './AgendaTimeline'
import { MonthTabs } from './MonthTabs'

interface AgendaViewToggleProps {
  groups: WeekGroup[]
  events: FilmReleaseEvent[]
  children: React.ReactNode
}

export function AgendaViewToggle({ groups, events, children }: AgendaViewToggleProps) {
  const [view, setView]           = useState<'grid' | 'timeline'>('timeline')
  const [showEmpty, setShowEmpty] = useState(true)

  const allGroups      = useMemo(() => fillWeekGaps(groups), [groups])
  const timelineGroups = showEmpty ? allGroups : groups

  return (
    <>
      {/* MonthTabs toujours visible — key={view} force le remontage pour rebrancher l'IntersectionObserver */}
      <MonthTabs key={view} groups={allGroups} />

      <div className="flex justify-end items-center gap-2 mb-3 mt-1">
        {view === 'timeline' && (
          <button
            onClick={() => setShowEmpty(v => !v)}
            className="flex items-center gap-1.5 text-[10px] font-body font-semibold text-muted/70 border border-[#2a3a5a]/60 rounded-full px-3 py-1.5 transition-colors hover:border-muted/50"
            aria-pressed={!showEmpty}
          >
            {showEmpty ? '○ Masquer semaines vides' : '● Toutes les semaines'}
          </button>
        )}
        <button
          onClick={() => setView(v => v === 'grid' ? 'timeline' : 'grid')}
          className="flex items-center gap-1.5 text-[10px] font-body font-semibold text-muted border border-[#2a3a5a] rounded-full px-3 py-1.5 transition-colors hover:border-muted/50 active:scale-95"
          aria-pressed={view === 'timeline'}
          aria-label={view === 'grid' ? 'Passer en vue frise' : 'Passer en vue grille'}
        >
          {view === 'grid' ? '≡ Frise' : '⊞ Grille'}
        </button>
      </div>

      {/* Rendu conditionnel — évite les id dupliqués entre grille et frise */}
      {view === 'grid' && <div>{children}</div>}
      {view === 'timeline' && <AgendaTimeline groups={timelineGroups} events={events} />}
    </>
  )
}
