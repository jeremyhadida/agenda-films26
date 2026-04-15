'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  paysId: string
}

export function BottomNav({ paysId }: BottomNavProps) {
  const pathname = usePathname()
  const isAgenda = !pathname.includes('/mouvements')
  const isMouvements = pathname.includes('/mouvements')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-low/70 backdrop-blur-xl md:hidden border-t border-surface-card">
      <div className="flex">
        <Link
          href={`/${paysId}`}
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-body transition-colors ${
            isAgenda ? 'text-text' : 'text-muted'
          }`}
        >
          <span className="text-lg">📅</span>
          <span>Agenda</span>
          {isAgenda && <span className="w-1 h-1 bg-gold rounded-full" />}
        </Link>

        <Link
          href={`/${paysId}/mouvements`}
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-body transition-colors ${
            isMouvements ? 'text-text' : 'text-muted'
          }`}
        >
          <span className="text-lg">📰</span>
          <span>Mouvements</span>
          {isMouvements && <span className="w-1 h-1 bg-gold rounded-full" />}
        </Link>
      </div>
    </nav>
  )
}
