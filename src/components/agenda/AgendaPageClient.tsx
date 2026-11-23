'use client'

import type { FilmReleaseEvent, WeekGroup } from '@/lib/types'
import { MonthTabs } from './MonthTabs'
import { AgendaTimeline } from './AgendaTimeline'

interface AgendaPageClientProps {
  allGroups: WeekGroup[]
  events: FilmReleaseEvent[]
  paysId: string
  showAllWeeks?: boolean
}

export function AgendaPageClient({ allGroups, events, paysId, showAllWeeks }: AgendaPageClientProps) {
  // Frise continue sur toutes les années : le changement d'année se fait en
  // scrollant, et un film de n'importe quelle année reste atteignable
  // (clic depuis les mouvements, onglets de mois).
  const todayUTC = new Date()
  const dow = todayUTC.getUTCDay() || 7
  const mondayUTC = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate()))
  mondayUTC.setUTCDate(mondayUTC.getUTCDate() - dow + 1)
  const currentMondayStr = mondayUTC.toISOString().split('T')[0]

  const fromCurrentWeek = allGroups.filter(g => g.startDate >= currentMondayStr)
  const displayGroups = showAllWeeks || fromCurrentWeek.length === 0
    ? allGroups
    : fromCurrentWeek

  return (
    <>
      <MonthTabs groups={displayGroups} />
      <AgendaTimeline groups={displayGroups} events={events} paysId={paysId} />
    </>
  )
}
