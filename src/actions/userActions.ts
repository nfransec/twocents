'use client'

import axios from "axios";
import { toast } from "sonner";

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.')
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else {
      toast.error('An unknown error occurred')
    }
  } else {
    toast.error('An unknown error occurred')
  }
}

export async function logout() {
  try {
    await axios.get('/api/users/logout')
    toast.success('Logout successful')
    // Import and use the router to redirect the user
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push('/login')
    return true
  } catch (error) {
    handleError(error)
    return false
  }
}
