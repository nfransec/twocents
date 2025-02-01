'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, ChevronRight, ChevronDown, Bell, CreditCard, Banknote, ChevronLeft } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"

export interface UserType {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  username: string
  profilePicture: string
}

const userFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }).optional(),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  bankStatement: z.custom<File[]>().optional(),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, { message: 'You must agree to the privacy policy to proceed.'}),
  acknowledgementConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, { message: 'You must agree to the acknowledgement policy to proceed.'}),
});

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType>({
    _id: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    username: '',
    profilePicture: 'https://github.com/shadcn.png'
  })
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      phoneNumber: "",
    },
  })

  const toggleExpand = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section))
  }

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } else {
      toast.error('An unknown error occurred')
    }
  }

  const getUserDetails = useCallback(async () => {
    if (user._id) return;
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      const userData = res.data.data
      setUser(userData)
      userForm.reset({
        fullName: userData?.fullName ?? "",
        email: userData?.email ?? "",
        username: userData?.username ?? "",
        privacyConsent: false,
        acknowledgementConsent: false,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [user, userForm])

  const handleUpdateProfile = useCallback(async (updatedProfile: Partial<UserType>) => {
    try {
      // ... existing code ...
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  useEffect(() => {
    getUserDetails()
  }, [getUserDetails])

  return (
    <div className='flex flex-col text-white bg-[#1c1c28] sm:p-6 max-w-6xl mx-auto min-h-screen'>
      <header className="p-4 flex justify-between items-center">
        <ChevronLeft className="w-4 h-4" />
        <h1 className="text-xl font-bold">My Profile</h1>
        <Bell className="w-4 h-4" />
      </header>
      <main className='flex-1 overflow-y-auto'>
        <div className='max-w-md mx-auto px-2 py-2'>
          <div className="flex items-center justify-center mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-purple-700 text-xl">
                {user.fullName?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex flex-col'>
              <h2 className='text-16-regular'>{user.fullName || 'N/A'}</h2>
              <p className='text-14-regular text-green-500'>{user.username || 'N/A'}</p>
            </div>
          </div>

          <div className='border-b border-emerald-900 mb-4'/>

          <div className='space-y-4'>
            <Button
              variant='ghost'
              className='text-gray-300 w-full justify-between'
              onClick={() => toggleExpand('personalInfo')}
            >
              <div className='flex items-center gap-2'>
                <User className='h-5 w-5 text-gray-400' />
                Personal Information
              </div>
              {expandedSection === 'personalInfo' ? (
                <ChevronDown className='h-4 w-4 text-gray-400' />
              ) : (
                <ChevronRight className='h-4 w-4 text-gray-400' />
              )}
            </Button>
            {expandedSection === 'personalInfo' && (
              <div className="text-sm transition-all duration-300 ease-in-out bg-[#1c1c28] p-4 rounded-md flex flex-col gap-2">
                <p className="text-gray-500 mb-2">Full Name: <span className="float-right text-emerald-500">{user.fullName || 'N/A'}</span></p>
                <p className="text-gray-500 mb-2">Email: <span className="float-right text-emerald-500">{user.email || 'N/A'}</span></p>
                <p className="text-gray-500 mb-2">Gender: <span className="float-right text-emerald-500">Prefer not to say</span></p>
                <p className="text-gray-500 mb-2">Phone Number: <span className="float-right text-emerald-500">{user.phoneNumber || 'N/A'}</span></p>
              </div>
            )}

            <Button
              variant='ghost'
              className='text-gray-300 w-full justify-between'
              onClick={() => toggleExpand('notifications')}
            >
              <div className='flex items-center gap-2'>
                <Bell className='h-5 w-5 text-gray-400' />
                Notifications
              </div>
              {expandedSection === 'notifications' ? (
                <ChevronDown className='h-4 w-4 text-gray-400' />
              ) : (
                <ChevronRight className='h-4 w-4 text-gray-400' />
              )}
            </Button>
            {expandedSection === 'notifications' && (
              <div className="text-sm transition-all duration-300 ease-in-out bg-[#1c1c28] p-4">
                <p className="text-emerald-500 mb-4">No new notifications</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">Enable Notifications</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            )}

            <Button
              variant='ghost'
              className='text-gray-300 w-full justify-between'
              onClick={() => toggleExpand('cardSettings')}
            >
              <div className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5 text-gray-400' />
                Card Settings
              </div>
              {expandedSection === 'cardSettings' ? (
                <ChevronDown className='h-4 w-4 text-gray-400' />
              ) : (
                <ChevronRight className='h-4 w-4 text-gray-400' />
              )}
            </Button>
            {expandedSection === 'cardSettings' && (
              <div className="text-sm transition-all duration-300 ease-in-out bg-[#1c1c28] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">Allow Card Number</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-500">Allow CVV</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-500">Allow Debit Cards</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            )}

            <Button
              variant='ghost'
              className='text-gray-300 w-full justify-between'
              onClick={() => toggleExpand('bankAccounts')}
            >
              <div className='flex items-center gap-2'>
                <Banknote className='h-5 w-5 text-gray-400' />
                Bank Accounts
              </div>
              {expandedSection === 'bankAccounts' ? (
                <ChevronDown className='h-4 w-4 text-gray-400' />
              ) : (
                <ChevronRight className='h-4 w-4 text-gray-400' />
              )}
            </Button>
            {expandedSection === 'bankAccounts' && (
              <div className="text-sm transition-all duration-300 ease-in-out bg-[#1c1c28] p-4">
                <p className="text-emerald-500">No bank accounts connected</p>
              </div>
            )}
          </div>

          <div className='border-b border-emerald-900 mt-4 mb-4'/>

          <LogoutButton />
        </div>
      </main>
    </div>
  )
}
