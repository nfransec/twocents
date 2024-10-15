'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, CreditCard, User, Settings, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from "sonner"

export function Navigation() {
  const router = useRouter()

  const logout = async () => {
    try {
      await axios.get('/api/users/logout')
      router.push('/login')
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" className="flex items-center space-x-2">
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>
      <Link href="/cards" className="flex items-center space-x-2">
        <CreditCard className="w-5 h-5" />
        <span>Cards</span>
      </Link>
      <Link href="/profile" className="flex items-center space-x-2">
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
      <Link href="/settings" className="flex items-center space-x-2">
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
      <Button variant='ghost' onClick={logout} className="flex items-center space-x-2">
        <LogOut className='w-5 h-5' />
        <span>Logout</span>
      </Button>
    </nav>
  
  )
}