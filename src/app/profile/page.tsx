'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Bell, CreditCard, FileText, HelpCircle, Home, LogOut, User } from "lucide-react"
import CustomSidebar from "@/components/customSidebar"
import CustomFormField from "@/components/CustomFormField"
import { FormFieldType } from "@/components/forms/UserForm"

interface UserType {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  username: string
  profilePicture: string
}

interface AccountType {
  _id: string
  accountNumber: string
  isBlocked: boolean
}

interface BillType {
  _id: string
  name: string
  isPaid: boolean
}

const userFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
})

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [accounts, setAccounts] = useState<AccountType[]>([])
  const [bills, setBills] = useState<BillType[]>([])
  const [smsAlerts, setSmsAlerts] = useState(false)

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      phoneNumber: "",
    },
  })

  const getUserDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      const userData = res.data.data
      setUser(userData)
      userForm.reset({
        fullName: userData?.fullName ?? "",
        email: userData?.email ?? "",
        phoneNumber: userData?.phoneNumber ?? "",
        username: userData?.username ?? "",
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [userForm])

  const getAccounts = useCallback(async () => {
    try {
      const res = await axios.get('/api/accounts')
      setAccounts(res.data.data)
    } catch (error) {
      handleError(error)
    }
  }, [])

  const getBills = useCallback(async () => {
    try {
      const res = await axios.get('/api/bills')
      setBills(res.data.data)
    } catch (error) {
      handleError(error)
    }
  }, [])

  useEffect(() => {
    getUserDetails()
    getAccounts()
    getBills()
  }, [getUserDetails, getAccounts, getBills])

  const onSubmitUserForm = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true)
    try {
      await axios.put('/api/users/update', values)
      toast.success("Profile updated successfully")
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
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

  const logout = async () => {
    setIsLoading(true)
    try {
      await axios.get('/api/users/logout')
      toast.success('Logout successful')
      router.push('/login')
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      <CustomSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white mt-4">{user?.fullName?.split(' ')[0]}'s dashboard</h1>
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-400 mr-4" />
              <div className="flex items-center">
                <Image
                  src={user?.profilePicture || "/assets/icons/user2.svg"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
                <span className="text-sm font-medium text-white">Hello, <span className="font-bold text-green-500">{user?.fullName?.split(' ')[0]}</span></span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Card */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>My profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <Image
                      src={user?.profilePicture || "/assets/icons/user2.svg"}
                      alt="Profile"
                      width={200}
                      height={200}
                      className="rounded-full mb-4"
                    />
                    <p className="text-sm text-gray-500">Last login: 07 Aug 2021 14:04</p>
                  </div>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onSubmitUserForm)} className="space-y-4">

                      <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={userForm.control}
                          name="fullName"
                          placeholder="John Doe"
                          iconSrc="/assets/icons/user.svg"
                          iconAlt="user"
                      />

                      <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={userForm.control}
                        name="username"
                        placeholder="johndoe"
                        iconSrc="/assets/icons/username.svg"
                        iconAlt="user"
                        description="This is your unique username on the platform."
                      />

                      <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={userForm.control}
                          name="email"
                          placeholder="johndoe@gmail.com"
                          iconSrc="/assets/icons/email2.svg"
                          iconAlt="email"
                      />
        
                      <CustomFormField
                          fieldType={FormFieldType.PHONE_INPUT}
                          control={userForm.control}
                          name="phoneNumber"
                          placeholder="(555) 123-4567"
                      />
                    
                      <div className="flex flex-row space-x-4 mt-6 justify-between">
                        <Button type="submit" className="w-full bg-green-500" disabled={isLoading}>
                          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                          Update profile
                        </Button>
                        <Button
                          type="button"
                          className="w-full bg-red-500 text-white"
                          onClick={logout}
                          disabled={isLoading}
                        >
                          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                          Logout
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Accounts and Bills Cards */}
              <div className="flex-1 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Accounts</CardTitle>
                    <Button variant="outline" size="sm">Edit</Button>
                  </CardHeader>
                  <CardContent>
                    {accounts.map((account) => (
                      <div key={account._id} className="flex justify-between items-center mb-2">
                        <span>{account.accountNumber}</span>
                        <Button
                          variant={account.isBlocked ? "destructive" : "secondary"}
                          size="sm"
                        >
                          {account.isBlocked ? "Unblock account" : "Block Account"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My bills</CardTitle>
                    <Button variant="outline" size="sm">Filter by</Button>
                  </CardHeader>
                  <CardContent>
                    {bills.map((bill) => (
                      <div key={bill._id} className="flex justify-between items-center mb-2">
                        <span>{bill.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.isPaid ? 'Bill paid' : 'Not paid'}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}