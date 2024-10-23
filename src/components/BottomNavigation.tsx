'use client'

import React from 'react'
import { Home, Search, User, CreditCard, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
  // { href: '/home', icon: Home, label: 'Home' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <motion.div 
          className="flex justify-around items-center bg-dark-200 text-white rounded-t-xl shadow-lg"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="relative py-4 px-3 flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon 
                    className={`h-6 w-6 ${isActive ? 'text-green-500' : 'text-gray-400'}`} 
                  />
                </motion.div>
                <span className={`text-xs mt-1 ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-500"
                    layoutId="bottomBar"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </motion.div>
      </div>
    </nav>
  )
}