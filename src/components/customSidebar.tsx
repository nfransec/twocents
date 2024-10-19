import React from 'react'
import { Bell, CreditCard, FileText, HelpCircle, Home, LogOut, User } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/userActions'

const CustomSidebar = () => {
  const pathname = usePathname()

  const NavItem = ({ href, icon: Icon, children, onClick }: { href: string, icon: React.ElementType, children: React.ReactNode, onClick?: () => void }) => {
    const isActive = pathname === href
    return (
      <Link href={href} className={`flex items-center px-4 py-2 text-white ${isActive ? 'bg-green-500' : 'hover:bg-green-500'}`} onClick={onClick}>
        <Icon className="h-5 w-5" />
        <span className="ml-3 hidden md:inline">{children}</span>
      </Link>
    )
  }

  return (
    <div className="fixed inset-y-0 left-0 flex flex-col justify-between w-16 md:w-64 bg-dark-200 shadow-md z-10 transition-all duration-300">
      <div>
        <div className="p-4 flex justify-center md:justify-start">
          <Image src="/assets/icons/app-logo2.svg" alt="Logo" width={50} height={50} />
        </div>
        <nav className="mt-8 space-y-8">
          <NavItem href="/profile" icon={Home}>My dashboard</NavItem>
          <NavItem href="/accounts" icon={User}>Accounts</NavItem>
          <NavItem href="/cards" icon={CreditCard}>Credit Cards</NavItem>
          <NavItem href="/payments" icon={FileText}>Payments</NavItem>
          <NavItem href="/transactions" icon={Bell}>Transactions</NavItem>
          <NavItem href="/help" icon={HelpCircle}>Help</NavItem>
        </nav>
      </div>
      {/* <div className="p-4 flex flex-row items-center cursor-pointer" onClick={logout}>
        <LogOut className="h-5 w-5 text-white" />
        <span className="ml-3 hidden md:inline">Logout</span>
      </div> */}
    </div>
  )
}

export default CustomSidebar
