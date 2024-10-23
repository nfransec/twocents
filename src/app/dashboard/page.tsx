'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Bell, Home, BarChart2, RefreshCcw, Clock, CreditCard, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"

// const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active: boolean }) => (
//   <Button variant={active ? "secondary" : "ghost"} className={`flex items-center gap-2 ${active ? 'bg-[#e9e75a] text-black' : 'text-white'}`}>
//     {icon}
//     <span className="hidden sm:inline">{label}</span>
//   </Button>
// )
export interface UserType {
    _id: string
    fullName: string
    email: string
    profilePicture: string
}

const TransactionItem = ({ icon, name, date, time, amount }: { icon: React.ReactNode, name: string, date: string, time: string, amount: string}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-200">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm sm:text-base">{name}</p>
        <p className="text-xs sm:text-sm text-gray-500">{date} · {time}</p>
      </div>
    </div>
    <p className="font-semibold text-sm sm:text-base">{amount}</p>
  </div>
)

export default function DashboardPage() {
    const [user, setUser] = useState<UserType | null>(null)
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
      }, [])

  return (
    <div className="bg-[#1c1c28] text-white p-4 sm:p-6 rounded-3xl max-w-6xl mx-auto">

      <header className="flex flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00ffbd] rounded-full"></div>
          <span className="text-xl font-bold">Dashboard</span>
        </div>
        {/* <nav className="flex gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto">
          <NavItem icon={<Home size={18} />} label="Home" active />
          <NavItem icon={<RefreshCcw size={18} />} label="Transaction" active={false} />
          <NavItem icon={<Clock size={18} />} label="Payment" active={false} />
          <NavItem icon={<CreditCard size={18} />} label="Cards" active={false} />
        </nav> */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell size={18} />
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-[#00ffbd] font-bold">{user?.fullName}</span>
        </div>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-2 grid gap-6">
          <div className="bg-[#e9e75a] rounded-3xl p-4 sm:p-6 text-black">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Total Due</h2>
                <p className="text-2xl sm:text-4xl font-bold">₹228,621.97</p>
              </div>
              <Button className="bg-white text-black text-sm sm:text-base">+ ₹2000</Button>
            </div>
            <div className="h-24 sm:h-32 bg-[#d5d350] rounded-xl mb-4">
                <div className='bg-dark-200 w-1/4 h-full rounded-l-xl'></div>
            </div>
            <Button variant="ghost" className="text-black flex items-center gap-2 text-sm sm:text-base">
              +10% <span>compared to last month</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#e9e75a] rounded-3xl p-4 sm:p-6 text-black">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Reward Points</h2>
              <p className="text-2xl sm:text-4xl font-bold mb-2">50%</p>
              <p>Milestone achieved</p>
              <div className="w-full bg-[#d5d350] h-2 rounded-full mt-4">
                <div className="w-1/2 bg-black h-2 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-[#252836] rounded-3xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#00ffbd] text-xl sm:text-2xl font-bold">+₹ 427,230.82</span>
                  <Button size="sm" className="bg-[#2f3142]">+12%</Button>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">Income this month</p>
              </div>
              <div className="bg-[#252836] rounded-3xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#ff5c5c] text-xl sm:text-2xl font-bold">-₹ 228,621.97</span>
                  <Button size="sm" className="bg-[#2f3142]">+17%</Button>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">Spent this month</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#252836] rounded-3xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Budget</h2>
            <Button variant="ghost" className="text-gray-400 text-sm sm:text-base">
              May 2024 <ChevronDown size={16} />
            </Button>
          </div>
          <div className="h-48 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 mt-6 sm:mt-10">
            {['1 may', '8 may', '15 may', '22 may', '29 may'].map((date) => (
              <div key={date} className="flex-1">
                <div className="bg-orange-700 h-24 sm:h-32 rounded-t-lg"></div>
                <div className="bg-blue-300 h-12 sm:h-16 rounded-t-lg -mt-2 sm:-mt-4"></div>
                <div className="bg-purple-500 h-16 sm:h-24 rounded-t-lg -mt-2 sm:-mt-4"></div>
                <p className="text-center text-xs mt-1 sm:mt-2">{date}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between mt-4 text-xs sm:text-sm">
            <span className="flex items-center gap-2"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-700"></span> Income</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-300"></span> Spent</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500"></span> Savings</span>
          </div>
        </div>
      </main>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-3xl p-4 sm:p-6 text-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Recent transactions</h2>
            <Button variant="link" className="text-black text-sm sm:text-base">
              View all <ChevronRight size={16} />
            </Button>
          </div>
          <TransactionItem
            icon={<span className="text-xl sm:text-2xl">🅿️</span>}
            name="PhonePe"
            date="12 October"
            time="11:55 AM"
            amount="- ₹1276.22"
          />
          <TransactionItem
            icon={<span className="text-xl sm:text-2xl">🎮</span>}
            name="PlayStation"
            date="18 October"
            time="7:50 PM"
            amount="- ₹4999.00"
          />
          <TransactionItem
            icon={<span className="text-xl sm:text-2xl">🏠</span>}
            name="IHCL"
            date="19 October"
            time="11:17 AM"
            amount="- ₹8617.86"
          />
          <TransactionItem
            icon={<span className="text-xl sm:text-2xl">🎵</span>}
            name="Apple Music"
            date='22 October'
            time="09:17 AM"
            amount="- ₹199.00"
          />
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-6 text-black">
          <div className="bg-[#e9e75a] rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <span className="text-xs sm:text-sm">HDFC Bank</span>
              <span className="text-xs sm:text-sm">₹</span>
            </div>
            <h3 className="text-lg sm:text-xl mb-2">Infinia</h3>
            <p className="text-2xl sm:text-3xl font-bold mb-4">₹ 74,872.20</p>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span>*** 877</span>
              <span>06/28</span>
              <span className="font-bold">VISA</span>
            </div>
          </div>
          <Button className="w-full bg-black text-white flex items-center justify-center gap-2 text-sm sm:text-base">
            <Plus size={16} /> Add new card
          </Button>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-6 text-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Top spending</h2>
            <Button variant="link" className="text-black text-sm sm:text-base">
              View all <ChevronRight size={16} />
            </Button>
          </div>
          <div className="relative h-36 w-36 sm:h-48 sm:w-48 mx-auto">
            <div className="absolute inset-0 bg-[#e9e75a] rounded-full"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#00ffbd] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-[#3e4154] rounded-full"></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between mt-4 text-xs sm:text-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#e9e75a]"></span>
                <span>60% Home</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#00ffbd]"></span>
                <span>20% Auto & Transport</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#3e4154]"></span>
                <span>15% Entertainment</span>
              </div>
            </div>
            <div className="space-y-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">₹48,120.78</Button>
              <Button variant="outline" size="sm">₹15,234.10</Button>
              <Button variant="outline" size="sm">₹4,999.00</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}