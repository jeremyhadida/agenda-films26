'use client'

import { useEffect, useState } from 'react'
import type { WeekGroup } from '@/lib/types'

const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface MonthTabsProps {
  groups: WeekGroup[]
}

function getMonthFromDate(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00Z').getUTCMonth()
}

function getUniqueMonths(groups: WeekGroup[]): { month: number; year: number; firstWeek: number }[] {
  const seen = new Set<string>()
  const result: { month: number; year: number; firstWeek: number }[] = []
  for (const group of groups) {
    const d = new Date(group.startDate + 'T00:00:00Z')
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ month: d.getUTCMonth(), year: d.getUTCFullYear(), firstWeek: group.isoWeek })
    }
  }
  return result
}

export function MonthTabs({ groups }: MonthTabsProps) {
  const months = getUniqueMonths(groups)
  const [activeWeek, setActiveWeek] = useState<number>(groups[0]?.isoWeek ?? 0)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const group of groups) {
      const el = document.getElementById(`week-${group.isoWeek}`)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveWeek(group.isoWeek) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [groups])

  function scrollToWeek(isoWeek: number) {
    document.getElementById(`week-${isoWeek}`)?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeGroup = groups.find(g => g.isoWeek === activeWeek)
  const activeMonth = activeGroup ? getMonthFromDate(activeGroup.startDate) : months[0]?.month

  return (
    <div className="sticky top-14 z-40 bg-surface/80 backdrop-blur-xl py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {months.map(({ month, year, firstWeek }) => (
            <button
              key={`${year}-${month}`}
              onClick={() => scrollToWeek(firstWeek)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body transition-colors ${
                activeMonth === month
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
