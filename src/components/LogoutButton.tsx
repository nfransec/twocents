'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await axios.get('/api/users/logout')
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('An error occurred while logging out')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-white ml-1"
    >
      {isLoading ? 'Logging out...' : <LogOut className="h-5 w-5" />}
    </Button>
  )
}

