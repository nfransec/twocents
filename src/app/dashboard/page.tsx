'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronRight, ChevronLeft, Search, ArrowUpRight, Wallet, CreditCard, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import { format, parse } from 'date-fns'

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
  paymentDate?: string
  paidAmount?: number
  isPaid: boolean
  paymentHistory?: {
    amount: number
    date: string
    billingMonth: string
    outstandingAfterPayment: number
  }[]
  lastPaymentAmount?: number
  lastPaymentDate?: string
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

interface PaymentHistory {
  amount: number;
  date: Date;
  billingMonth: string;
  outstandingAfterPayment: number;
  cardName?: string;
  bankName?: string;
}

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

  const calculateMonthlyPayments = (cards: CardType[]) => {
    console.log('All cards:', cards); // Log all cards
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    console.log('Current month/year:', currentMonth, currentYear);
    
    return cards.reduce((total, card) => {
      console.log('Processing card:', {
        cardName: card.cardName,
        isPaid: card.isPaid,
        paidAmount: card.paidAmount,
        paymentDate: card.paymentDate
      });
      
      // If the card is paid and has a paidAmount
      if (card.isPaid && card.paidAmount) {
        console.log('Card is paid with amount:', card.paidAmount);
        return total + card.paidAmount;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/cards');
        if (response.data.success) {
          const cards = response.data.data;
          setCards(cards);
          const totalPayments = calculateMonthlyPayments(cards);
          console.log('Total monthly payments calculated:', totalPayments);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
        toast.error('Failed to fetch cards');
      }
    };

    fetchData();
  }, []);

  const getAllPaymentHistory = (cards: CardType[]) => {
    const allPayments = cards.flatMap(card => 
      (card.paymentHistory || []).map(payment => ({
        ...payment,
        cardName: card.cardName,
        bankName: card.bankName
      }))
    );

    // Sort by date, most recent first
    return allPayments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const formatBillingMonth = (billingMonth: string) => {
    try {
      // Parse YYYY-MM format to a Date object
      const date = parse(billingMonth, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy');
    } catch (error) {
      console.error('Error parsing billing month:', error);
      return billingMonth; // Return original string if parsing fails
    }
  };

  return (
    <div className="flex flex-col text-foreground min-h-screen bg-[#1c1c28] text-white">
        <div className='flex items-center justify-between p-4 bg-zinc-900'>
            <h1 className='font-extrabold'>Manage your cards</h1>
            <Button variant="outline" className='rounded-full hover:bg-gray-600'>Add card</Button>
        </div>

        <main className="flex-1 container py-2 space-y-4">
        <div className='p-4'>
            <h2 className='text-14-regular text-gray-200 mb-4'>SUMMARY ACROSS CARDS</h2>
            <div className='flex flex-row gap-4'>
                <Card className='bg-zinc-900 w-48'>
                    <CardHeader>
                        <CardTitle>₹ {totalDue.toLocaleString()}</CardTitle>
                        <CardDescription>total due</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ArrowRight className='w-5 h-5' />
                    </CardContent>
                </Card>
                <Card className='bg-zinc-900 w-48'>
                    <CardHeader>
                        <CardTitle>₹ {calculateMonthlyPayments(cards).toLocaleString()}</CardTitle>
                        <CardDescription>monthly payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ArrowRight className='w-5 h-5' />
                    </CardContent>
                </Card>
            </div>
        </div>
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
                <Card className="bg-gradient-to-br from-purple-900 to-purple-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-purple-100">Monthly Payments</p>
                        <h2 className="text-2xl font-bold text-white">
                          ₹{calculateMonthlyPayments(cards).toLocaleString()}
                        </h2>
                      </div>
                      <CreditCard className="w-8 h-8 text-purple-300" />
                    </div>
                    <p className="text-xs text-purple-200 mt-2">
                      Total credit card payments this month
                    </p>
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

          {/* Payment History Section */}
          <div className="bg-slate-800 rounded-xl p-6 mt-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment History
            </h2>
            
            <div className="space-y-4">
              {getAllPaymentHistory(cards).length > 0 ? (
                getAllPaymentHistory(cards).map((payment, index) => (
                  <div 
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        {payment.cardName} ({payment.bankName})
                      </p>
                      <p className="text-xs text-slate-300">
                        {format(new Date(payment.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-400">
                        ₹{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        Billing Month: {formatBillingMonth(payment.billingMonth)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-6">
                  <p>No payment history available</p>
                </div>
              )}
            </div>
          </div>
        </main>
    </div>
  )
}
