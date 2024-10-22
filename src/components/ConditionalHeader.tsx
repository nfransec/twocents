'use client'

import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import Image from 'next/image'

export default function ConditionalHeader() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (isAuthPage) {
    return null
  }

  return (
    <header className="p-4 flex justify-between items-center bg-dark-300">
      <h1 className="text-xl font-bold text-white">TwoCents</h1>
      <LogoutButton />
    </header>
  )
}

