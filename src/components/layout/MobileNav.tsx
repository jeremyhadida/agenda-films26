'use client'

import { useState } from 'react'
import { BottomNav } from './BottomNav'
import { MouvementsDrawer } from '@/components/mouvements/MouvementsDrawer'
import type { FilmReleaseEvent, Film } from '@/lib/types'

interface MobileNavProps {
  paysId: string
  events: (FilmReleaseEvent & { film: Film })[]
}

export function MobileNav({ paysId, events }: MobileNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <BottomNav paysId={paysId} onMouvements={() => setDrawerOpen(true)} />
      <MouvementsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        events={events}
        paysId={paysId}
      />
    </>
  )
}
