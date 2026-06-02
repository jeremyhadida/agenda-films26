'use client'

import { useState } from 'react'
import type { FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { getIsoYear } from '@/lib/utils'
import { MonthTabs } from './MonthTabs'
import { AgendaTimeline } from './AgendaTimeline'

interface AgendaPageClientProps {
  allGroups: WeekGroup[]
  events: FilmReleaseEvent[]
  paysId: string
}

export function AgendaPageClient({ allGroups, events, paysId }: AgendaPageClientProps) {
  const availableYears = [...new Set(
    allGroups.filter(g => g.films.length > 0).map(g => getIsoYear(g.startDate))
  )].sort((a, b) => a - b)

  const currentYear = new Date().getFullYear()
  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : (availableYears.at(-1) ?? currentYear)

  const [selectedYear, setSelectedYear] = useState(defaultYear)

  const filteredGroups = allGroups.filter(g => getIsoYear(g.startDate) === selectedYear)

  return (
    <>
      {availableYears.length > 1 && (
        <div className="flex justify-end px-4 pt-3 pb-1">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-surface-low border border-[#2a4a7a] text-text font-body text-[11px] rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:border-gold/60 appearance-none pr-6"
            style={{ backgroundImage: 'none' }}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}
      <MonthTabs groups={filteredGroups} />
      <AgendaTimeline groups={filteredGroups} events={events} />
    </>
  )
}
