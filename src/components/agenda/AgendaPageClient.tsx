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

  const filteredGroups = allGroups.filter(g => getIsoYear(g.startDate) === selectedYear)

  const todayUTC = new Date()
  const dow = todayUTC.getUTCDay() || 7
  const mondayUTC = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate()))
  mondayUTC.setUTCDate(mondayUTC.getUTCDate() - dow + 1)
  const currentMondayStr = mondayUTC.toISOString().split('T')[0]

  const fromCurrentWeek = filteredGroups.filter(g => g.startDate >= currentMondayStr)
  const displayGroups = showAllWeeks
    ? filteredGroups
    : (selectedYear === currentYear && fromCurrentWeek.length > 0 ? fromCurrentWeek : filteredGroups)

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
      <AgendaTimeline groups={displayGroups} events={events} />
    </>
  )
}
