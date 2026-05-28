'use client'

import { useEffect, useRef, useState } from 'react'
import type { WeekGroup } from '@/lib/types'

const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface MonthTabsProps {
  groups: WeekGroup[]
}

function getUniqueMonths(groups: WeekGroup[]): { month: number; year: number; firstWeekStartDate: string }[] {
  const seen = new Set<string>()
  const result: { month: number; year: number; firstWeekStartDate: string }[] = []
  // N'utiliser que les semaines avec des films pour les cibles de scroll
  // (les semaines vides peuvent ne pas avoir d'élément DOM selon le mode)
  const filmWeeks = groups.filter(g => g.films.length > 0)
  for (const group of filmWeeks) {
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
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Synchroniser l'état actif avec le scroll de la page
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

  // Amener l'onglet actif en vue dans la barre horizontale
  const activeD = new Date(activeStartDate + 'T00:00:00Z')
  const activeMonthKey = `${activeD.getUTCFullYear()}-${activeD.getUTCMonth()}`

  useEffect(() => {
    const btn = tabRefs.current.get(activeMonthKey)
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeMonthKey])

  function scrollToWeek(startDate: string) {
    // Feedback visuel immédiat : ne pas attendre l'IntersectionObserver
    setActiveStartDate(startDate)
    document.getElementById(`week-${startDate}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sticky top-14 z-40 bg-surface/80 backdrop-blur-xl py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {months.map(({ month, year, firstWeekStartDate }) => {
            const key = `${year}-${month}`
            const isActive = activeMonthKey === key
            return (
              <button
                key={key}
                ref={el => { if (el) tabRefs.current.set(key, el); else tabRefs.current.delete(key) }}
                onClick={() => scrollToWeek(firstWeekStartDate)}
                aria-pressed={isActive}
                className={`flex-shrink-0 flex items-center min-h-[44px] px-4 rounded-full text-sm font-body transition-colors ${
                  isActive
                    ? 'bg-gold text-surface font-semibold'
                    : 'text-muted hover:text-text'
                }`}
              >
                {FR_MONTHS[month]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
