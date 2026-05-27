'use client'

import { useState } from 'react'
import type { FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { AgendaTimeline } from './AgendaTimeline'

interface AgendaViewToggleProps {
  groups: WeekGroup[]
  events: FilmReleaseEvent[]
  children: React.ReactNode
}

export function AgendaViewToggle({ groups, events, children }: AgendaViewToggleProps) {
  const [view, setView] = useState<'grid' | 'timeline'>('timeline')

  return (
    <>
      <div className="flex justify-end mb-3 mt-1">
        <button
          onClick={() => setView(v => v === 'grid' ? 'timeline' : 'grid')}
          className="flex items-center gap-1.5 text-[10px] font-body font-semibold text-muted border border-[#2a3a5a] rounded-full px-3 py-1.5 transition-colors hover:border-muted/50 active:scale-95"
          aria-pressed={view === 'timeline'}
          aria-label={view === 'grid' ? 'Passer en vue frise' : 'Passer en vue grille'}
        >
          {view === 'grid' ? '≡ Frise' : '⊞ Grille'}
        </button>
      </div>

      <div className={view === 'grid' ? 'block' : 'hidden'}>{children}</div>

      {view === 'timeline' && <AgendaTimeline groups={groups} events={events} />}
    </>
  )
}
