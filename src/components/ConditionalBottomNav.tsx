'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from './BottomNavigation'

export default function ConditionalBottomNav() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (isAuthPage) {
    return null
  }

  return <BottomNavigation />
}

