'use client'
import { useEffect } from 'react'

interface ScrollToCurrentWeekProps {
  startDates: string[]
}

export function ScrollToCurrentWeek({ startDates }: ScrollToCurrentWeekProps) {
  useEffect(() => {
    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dayOfWeek = todayUTC.getUTCDay() || 7
    const monday = new Date(todayUTC)
    monday.setUTCDate(todayUTC.getUTCDate() - dayOfWeek + 1)
    const mondayStr = monday.toISOString().split('T')[0]

    // Semaine courante, sinon prochaine semaine disponible, sinon dernière
    const target =
      startDates.find(d => d === mondayStr) ??
      startDates.find(d => d >= mondayStr) ??
      startDates[startDates.length - 1]

    if (target) {
      document.getElementById(`week-${target}`)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [])

  return null
}
