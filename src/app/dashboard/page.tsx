'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronRight, ChevronLeft, Search, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, ArrowDown } from 'lucide-react'
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

const getAllPaymentHistory = (cards: CardType[]) => {
  return cards.reduce((history: PaymentHistory[], card) => {
    if (!card.paymentHistory) return history;
    
    const cardPayments = card.paymentHistory.map(payment => ({
      ...payment,
      cardName: card.cardName,
      bankName: card.bankName,
      date: new Date(payment.date)
    }));
    
    return [...history, ...cardPayments];
  }, []).sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Add this helper function to calculate the percentage change
const calculatePercentageChange = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const allTransactions = getAllPaymentHistory(cards)
  const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE)

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

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatBillingMonth = (billingMonth: string | undefined) => {
    try {
      if (!billingMonth) return 'N/A';
      
      // Check if billingMonth is in YYYY-MM format
      if (billingMonth.match(/^\d{4}-\d{2}$/)) {
        return format(parse(billingMonth, 'yyyy-MM', new Date()), 'MMMM yyyy');
      }
      
      // If it's already a date string, just format it
      return format(new Date(billingMonth), 'MMMM yyyy');
    } catch (error) {
      console.error('Error parsing billing month:', error);
      return billingMonth || 'N/A'; // Return original string or N/A if undefined
    }
  };

  const getPaginatedTransactions = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return allTransactions.slice(startIndex, endIndex)
  }

  // Calculate monthly payments (previous month's payments)
  const lastMonthPayments = calculateMonthlyPayments(cards);
  
  // Calculate percentage change
  const percentageChange = calculatePercentageChange(totalDue, lastMonthPayments);

  return (
    <div className="flex flex-col bg-[#1c1c28] text-white min-h-screen">
      <main className="flex-1 overflow-hidden px-4">
        <div className="max-w-7xl mx-auto py-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 border-b-2 border-gray-200 bg-white text-black">
              <TabsTrigger value="overview" className="hover:bg-gray-300">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="hover:bg-gray-300">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className='mt-4 border-none bg-gradient-to-r from-emerald-400 to-cyan-400'>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">Total Income</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">₹9,99,999.99</div>
                    <p className="text-xs text-muted-foreground text-black mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card className='bg-gradient-to-r from-rose-400 to-red-500 border-none'>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">Total Due</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalDue.toLocaleString()}</div>
                    <div className="flex items-center mt-1">
                      {percentageChange > 0 ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-error-800" />
                          <span className="text-xs text-error-800 ml-1">
                            +{percentageChange.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-success-700" />
                          <span className="text-xs font-bold text-success-800 ml-1">
                            {percentageChange.toFixed(1)}%
                          </span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground text-black ml-2">
                        from last month
                      </span>
                    </div>
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
              <Card className="relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, allTransactions.length)} of {allTransactions.length} transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getPaginatedTransactions().map((transaction, index) => (
                    <TransactionItem
                      key={index}
                      icon={<ArrowDown className="h-4 w-4" />}
                      name={`${transaction.cardName} (${transaction.bankName})`}
                      date={format(new Date(transaction.date), 'dd MMMM')}
                      time={format(new Date(transaction.date), 'hh:mm a')}
                      amount={`₹${transaction.amount.toLocaleString()}`}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
