'use client'

import { useEffect, useRef, useState } from 'react'
import type { WeekGroup } from '@/lib/types'

const FR_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface MonthTabsProps {
  groups: WeekGroup[]
  rightSlot?: React.ReactNode
}

function getUniqueMonths(groups: WeekGroup[]): { month: number; year: number; firstWeekStartDate: string }[] {
  const seen = new Set<string>()
  const result: { month: number; year: number; firstWeekStartDate: string }[] = []
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

export function MonthTabs({ groups, rightSlot }: MonthTabsProps) {
  const months = getUniqueMonths(groups)
  const [activeStartDate, setActiveStartDate] = useState<string>(groups[0]?.startDate ?? '')
  const [navVisible, setNavVisible] = useState(true)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  // Auto-hide sur mobile : masquer en scroll-down, ré-afficher en scroll-up
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (y < 80) {
        setNavVisible(true)
        lastScrollY.current = y
        return
      }
      setNavVisible(y < lastScrollY.current)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Synchroniser l'onglet actif avec le scroll — détection en haut du viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    for (const group of groups) {
      const el = document.getElementById(`week-${group.startDate}`)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStartDate(group.startDate) },
        { threshold: 0, rootMargin: '0px 0px -85% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [groups])

  const activeD = new Date(activeStartDate + 'T00:00:00Z')
  const activeMonthKey = `${activeD.getUTCFullYear()}-${activeD.getUTCMonth()}`

  // Centrer l'onglet actif — scroll horizontal uniquement, sans interférer avec le scroll de page
  useEffect(() => {
    const container = tabsContainerRef.current
    const btn = tabRefs.current.get(activeMonthKey)
    if (!container || !btn) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    const targetLeft = container.scrollLeft + bRect.left - cRect.left - (cRect.width - bRect.width) / 2
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' })
  }, [activeMonthKey])

  function scrollToWeek(startDate: string) {
    setNavVisible(true)
    setActiveStartDate(startDate)
    document.getElementById(`week-${startDate}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sticky top-14 z-40 bg-surface/80 backdrop-blur-xl">
      <div
        className={`overflow-hidden transition-[max-height] duration-200 ease-out md:max-h-[60px] ${
          navVisible ? 'max-h-[60px]' : 'max-h-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <div ref={tabsContainerRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-none pb-1">
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
          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>
      </div>
    </div>
  )
}
