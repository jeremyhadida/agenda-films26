'use client'

import { BottomNav } from './BottomNav'

interface MobileNavProps {
  paysId: string
}

export function MobileNav({ paysId }: MobileNavProps) {
  return <BottomNav paysId={paysId} />
}
