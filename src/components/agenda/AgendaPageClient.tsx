'use client'

import { useState } from 'react'
import type { FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { getIsoYear } from '@/lib/utils'
import { MonthTabs } from './MonthTabs'
import { AgendaTimeline } from './AgendaTimeline'
import { ScrollToCurrentWeek } from './ScrollToCurrentWeek'

interface AgendaPageClientProps {
  allGroups: WeekGroup[]
  events: FilmReleaseEvent[]
  paysId: string
  showAllWeeks?: boolean
}

export function AgendaPageClient({ allGroups, events, paysId, showAllWeeks }: AgendaPageClientProps) {
  const availableYears = [...new Set(
    allGroups.filter(g => g.films.length > 0).map(g => getIsoYear(g.startDate))
  )].sort((a, b) => a - b)

  const currentYear = new Date().getFullYear()
  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : (availableYears.at(-1) ?? currentYear)

  const [selectedYear, setSelectedYear] = useState(defaultYear)

  // Toutes les semaines de l'année sélectionnée — les films passés restent dans le DOM
  // pour que le scroll depuis LastMovementsPanel fonctionne même sur les sorties récentes.
  // ScrollToCurrentWeek positionne la vue sur la semaine courante au chargement.
  const displayGroups = allGroups.filter(g => getIsoYear(g.startDate) === selectedYear)

  const yearSelect = availableYears.length > 1 ? (
    <select
      value={selectedYear}
      onChange={e => setSelectedYear(Number(e.target.value))}
      className="bg-surface-low border border-[#2a4a7a] text-text font-body text-[11px] rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:border-gold/60 appearance-none"
    >
      {availableYears.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  ) : null

  return (
    <>
      <MonthTabs groups={displayGroups} rightSlot={yearSelect} />
      {!showAllWeeks && (
        <ScrollToCurrentWeek startDates={displayGroups.map(g => g.startDate)} />
      )}
      <AgendaTimeline groups={displayGroups} events={events} />
    </>
  )
}
