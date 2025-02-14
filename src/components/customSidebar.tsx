'use client'

import React from 'react'
import { 
  Bell, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  Home, 
  LogOut, 
  User,
  ChevronRight,
  Settings
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CustomSidebar = () => {
  const pathname = usePathname()

  const NavItem = ({ 
    href, 
    icon: Icon, 
    children, 
    onClick 
  }: { 
    href: string, 
    icon: React.ElementType, 
    children: React.ReactNode, 
    onClick?: () => void 
  }) => {
    const isActive = pathname === href
    
    return (
      <Link 
        href={href} 
        className={cn(
          "flex items-center px-4 py-3 text-light-600 hover:text-light-100 rounded-lg transition-all duration-200",
          "hover:bg-dark-300",
          isActive && "bg-primary-600 text-light-100 hover:bg-primary-700"
        )}
        onClick={onClick}
      >
        <Icon className={cn(
          "h-5 w-5",
          isActive ? "text-light-100" : "text-light-600"
        )} />
        <span className="ml-3 hidden md:inline font-medium">{children}</span>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 w-1 h-8 bg-primary-400 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    )
  }

  const navigationItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/cards', icon: CreditCard, label: 'Credit Cards' },
    { href: '/payments', icon: FileText, label: 'Payments' },
    { href: '/transactions', icon: Bell, label: 'Transactions' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  const bottomItems = [
    { href: '/help', icon: HelpCircle, label: 'Help Center' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="fixed inset-y-0 left-0 flex flex-col justify-between w-16 md:w-64 bg-dark-200 shadow-lg z-20">
      {/* Top Section */}
      <div>
        <div className="p-4 flex items-center justify-center md:justify-start">
          <Image 
            src="/assets/icons/app-logo2.svg" 
            alt="Logo" 
            width={40} 
            height={40}
            className="rounded-xl"
          />
          <span className="hidden md:inline ml-3 text-xl font-bold text-light-100">
            TwoCents
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="mt-8 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem 
                key={item.href} 
                href={item.href} 
                icon={item.icon}
              >
                {item.label}
              </NavItem>
            ))}
          </div>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-2">
        {bottomItems.map((item) => (
          <NavItem 
            key={item.href} 
            href={item.href} 
            icon={item.icon}
          >
            {item.label}
          </NavItem>
        ))}
        
        <button 
          onClick={() => {/* Add logout logic */}}
          className={cn(
            "flex items-center w-full px-4 py-3 text-error-400 hover:text-error-300 rounded-lg transition-all duration-200",
            "hover:bg-error-400/10"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3 hidden md:inline font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default CustomSidebar
