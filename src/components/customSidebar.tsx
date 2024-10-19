import React from 'react'
import { Bell, CreditCard, FileText, HelpCircle, Home, LogOut, User } from "lucide-react"
import Image from 'next/image'

const CustomSidebar = () => {
  return (
    <div className="w-64 bg-dark-200 shadow-md">
        <div className="p-4">
          <Image src="/assets/icons/app-logo2.svg" alt="Logo" width={50} height={50} />
        </div>
        <nav className="mt-8">
          <a href="/profile" className="flex items-center px-4 py-2 text-white bg-green-500">
            <Home className="mr-3 h-5 w-5" />
            My dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-white hover:bg-green-500">
            <User className="mr-3 h-5 w-5" />
            Accounts
          </a>
          <a href="/cards" className="flex items-center px-4 py-2 text-white hover:bg-green-500">
            <CreditCard className="mr-3 h-5 w-5" />
            Credit Cards
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-white hover:bg-green-500">
            <FileText className="mr-3 h-5 w-5" />
            Payments
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-white hover:bg-green-500">
            <Bell className="mr-3 h-5 w-5" />
            Transactions
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-white hover:bg-green-500">
            <HelpCircle className="mr-3 h-5 w-5" />
            Help
          </a>
        </nav>
      </div>
  )
}

export default CustomSidebar
