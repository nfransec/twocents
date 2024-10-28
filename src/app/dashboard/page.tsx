'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronRight, ChevronLeft, Search, ArrowUpRight, Wallet, CreditCard, ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"

export interface UserType {
  _id: string
  fullName: string
  email: string
  profilePicture: string
}

export interface CardType {
  _id: string
  cardName: string
  bankName: string
  cardLimit: number
  billingDate: string
  outstandingAmount: number
  cardNumber?: string
}

const TransactionItem = ({ icon, name, date, time, amount }: { icon: React.ReactNode, name: string, date: string, time: string, amount: string}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{date} · {time}</p>
      </div>
    </div>
    <p className={`font-semibold text-sm ${amount.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{amount}</p>
  </div>
)

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      const userData = res.data.data
      setUser(userData)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCards = async () => {
    try {
      const response = await axios.get('/api/cards')
      setCards(response.data.data)
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('Failed to fetch cards')
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
    
  useEffect(() => {
    fetchUser()
    fetchCards()
  }, [fetchUser])

  const totalDue = cards.reduce((acc, card) => acc + card.outstandingAmount, 0)

  return (
    <div className="flex flex-col text-foreground min-h-screen bg-[#1c1c28] text-white">
      <div className='bg-gradient-to-r from-purple-500 to-purple-900 border-none rounded-3xl mb-6'>
        <header className="sticky top-0 z-10 backdrop-blur">
          <div className="container flex justify-between items-center py-2">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          </div>
        </header>
        
          <div className="relative px-6 rounded-3xl bg-transparent">
            <Input type="text" placeholder="Search" className="pl-8" />
            <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>

          <div className='px-6 mt-4 flex items-center justify-center'>
            <h2 className='text-2xl font-bold'>Welcome back, {user?.fullName.split(' ')[0]}</h2>
          </div>

          <Card className="border-none mt-2">
            <CardHeader>
              <CardTitle className='flex justify-center'>Total Due</CardTitle>
              <CardDescription className="text-dark-900 flex justify-center">Across all cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4 flex justify-center">₹ {totalDue.toLocaleString()}</div>
              <Button variant="secondary" className="w-full text-black bg-white hover:bg-gradient-to-bl hover:from-gray-50 hover:to-gray-400 border-none">
                Pay Now <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <main className="flex-1 container py-2 space-y-4">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 border-b-2 border-gray-200  bg-white text-black">
              <TabsTrigger value="overview" className="hover:bg-gray-300">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="hover:bg-gray-300">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className='mt-4 border-none bg-gradient-to-r from-emerald-400 to-cyan-400'>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold ">Total Income</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">₹9,99,999.99</div>
                    <p className="text-xs text-muted-foreground text-black mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card className='bg-gradient-to-r from-rose-400 to-red-500 border-none'>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">Total Spent</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalDue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground text-black mt-1">+17% from last month</p>
                  </CardContent>
                </Card>
                <Card className='border-none bg-gradient-to-r from-slate-500 to-slate-800'>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
                    <div className="text-sm font-medium">46%</div>
                  </CardHeader>
                  <CardContent>
                    <div className='bg-dark-600 w-full h-1 rounded-full'>
                      <div className='bg-emerald-600 w-[46%] h-1 rounded-full'></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Milestone achieved</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>You made 12 transactions this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionItem
                    icon={<ArrowDown className="h-4 w-4" />}
                    name="PhonePe"
                    date="12 October"
                    time="11:55 AM"
                    amount="- ₹1,276.22"
                  />
                  <TransactionItem
                    icon={<ArrowDown className="h-4 w-4" />}
                    name="PlayStation"
                    date="18 October"
                    time="7:50 PM"
                    amount="- ₹4,999.00"
                  />
                  <TransactionItem
                    icon={<ArrowDown className="h-4 w-4" />}
                    name="IHCL"
                    date="19 October"
                    time="11:17 AM"
                    amount="- ₹8,617.86"
                  />
                  <TransactionItem
                    icon={<ArrowDown className="h-4 w-4" />}
                    name="Apple Music"
                    date='22 October'
                    time="09:17 AM"
                    amount="- ₹199.00"
                  />
                  <Button variant="outline" className="w-full mt-4">
                    View All Transactions <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    </div>
  )
}
