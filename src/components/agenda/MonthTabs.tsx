'use client'

import { useEffect, useState } from 'react'
import type { WeekGroup } from '@/lib/types'

const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface MonthTabsProps {
  groups: WeekGroup[]
}

function getUniqueMonths(groups: WeekGroup[]): { month: number; year: number; firstWeekStartDate: string }[] {
  const seen = new Set<string>()
  const result: { month: number; year: number; firstWeekStartDate: string }[] = []
  for (const group of groups) {
    const d = new Date(group.startDate + 'T00:00:00Z')
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ month: d.getUTCMonth(), year: d.getUTCFullYear(), firstWeekStartDate: group.startDate })
    }
  }
  return result
}

export function MonthTabs({ groups }: MonthTabsProps) {
  const months = getUniqueMonths(groups)
  const [activeStartDate, setActiveStartDate] = useState<string>(groups[0]?.startDate ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const group of groups) {
      const el = document.getElementById(`week-${group.startDate}`)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStartDate(group.startDate) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [groups])

  function scrollToWeek(startDate: string) {
    document.getElementById(`week-${startDate}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Derive active month key from active week's startDate
  const activeD = new Date(activeStartDate + 'T00:00:00Z')
  const activeMonthKey = `${activeD.getUTCFullYear()}-${activeD.getUTCMonth()}`

  return (
    <div className="sticky top-14 z-40 bg-surface/80 backdrop-blur-xl py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {months.map(({ month, year, firstWeekStartDate }) => (
            <button
              key={`${year}-${month}`}
              onClick={() => scrollToWeek(firstWeekStartDate)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
                activeMonthKey === `${year}-${month}`
                  ? 'bg-gold text-surface font-semibold'
                  : 'text-muted hover:text-text'
              }`}
            >
              {FR_MONTHS[month]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
