'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronRight, ChevronLeft, Search, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, ArrowDown, BarChart3, PieChart, TrendingUp, Calendar, Pencil, Check, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import { format, parse, subMonths, differenceInDays } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts'
import LoadingScreen from "@/components/LoadingScreen"
import { motion } from "framer-motion"

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
  <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
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

// Generate mock data for spending trends
const generateSpendingTrends = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.map((month, index) => {
    const isCurrentMonth = index === currentMonth;
    const isPastMonth = index < currentMonth;
    
    // Generate realistic spending data
    const baseAmount = Math.floor(Math.random() * 30000) + 20000;
    const variance = Math.floor(Math.random() * 10000) - 5000;
    
    return {
      name: month,
      spending: isPastMonth || isCurrentMonth ? baseAmount + variance : 0,
      income: isPastMonth || isCurrentMonth ? baseAmount + 15000 + Math.floor(Math.random() * 10000) : 0,
      savings: isPastMonth || isCurrentMonth ? Math.floor(Math.random() * 15000) + 5000 : 0,
    };
  });
};

// Generate category spending data
const generateCategoryData = () => {
  return [
    { name: 'Food', value: 25000, color: '#10B981' },
    { name: 'Shopping', value: 18000, color: '#3B82F6' },
    { name: 'Travel', value: 12000, color: '#8B5CF6' },
    { name: 'Bills', value: 15000, color: '#EC4899' },
    { name: 'Entertainment', value: 8000, color: '#F59E0B' },
  ];
};

// Reuse the card style function from cards page
const getCardStyle = (cardName: string) => {
  const name = cardName.toLowerCase()
  if (name.includes("infinia")) return "bg-teal-700"
  if (name.includes("amazon")) return "bg-black"
  if (name.includes("tata")) return "bg-purple-800"
  if (name.includes("play")) return "bg-orange-500"
  if (name.includes("ixigo")) return "bg-rose-500"
  if (name.includes("power")) return "bg-slate-800"
  if (name.includes("platinum")) return "bg-gray-700"
  if (name.includes("simply")) return "bg-emerald-600"
  if (name.includes("gold") || name.includes("mrcc")) return "bg-yellow-600"
  return "bg-teal-700" // default style
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const allTransactions = getAllPaymentHistory(cards)
  const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE)
  const [spendingTrends] = useState(generateSpendingTrends())
  const [categoryData] = useState(generateCategoryData())
  const [income, setIncome] = useState(999999.99)
  const [isEditingIncome, setIsEditingIncome] = useState(false)
  const [tempIncome, setTempIncome] = useState('')
  const [upcomingPayments, setUpcomingPayments] = useState<CardType[]>([])
  const [recentlyPaid, setRecentlyPaid] = useState<CardType[]>([])

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
    setIsLoading(true)
    try {
      const response = await axios.get("/api/cards")
      if (response.data.success) {
        const allCards: CardType[] = response.data.data.map((card: any) => ({
          ...card,
          isPaid: card.isPaid || false,
          outstandingAmount: card.outstandingAmount || 0,
          cardLimit: card.cardLimit || 0,
          cardName: card.cardName || "",
          bankName: card.bankName || "",
          billingDate: card.billingDate || "",
          _id: card._id || "",
          paymentHistory: card.paymentHistory || [],
        }))
        
        setCards(allCards)
        
        // Filter cards with outstanding payments
        const unpaidCards = allCards.filter(card => 
          !card.isPaid && card.outstandingAmount > 0
        )
        
        // Sort by due date (closest first)
        unpaidCards.sort((a, b) => {
          const dateA = getDueDate(a.billingDate)
          const dateB = getDueDate(b.billingDate)
          return dateA.getTime() - dateB.getTime()
        })
        
        setUpcomingPayments(unpaidCards)
        
        // Get recently paid cards (paid in the last 30 days)
        const paidCards = allCards.filter(card => 
          card.isPaid && card.paymentHistory && card.paymentHistory.length > 0
        )
        
        // Sort by most recently paid
        paidCards.sort((a, b) => {
          const dateA = new Date(a.paymentHistory?.[a.paymentHistory?.length - 1]?.date || 0)
          const dateB = new Date(b.paymentHistory?.[b.paymentHistory?.length - 1]?.date || 0)
          return dateB.getTime() - dateA.getTime()
        })
        
        setRecentlyPaid(paidCards.slice(0, 3)) // Show only the 3 most recently paid
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
      toast.error("Failed to fetch cards")
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
    
  useEffect(() => {
    fetchUser()
    fetchCards()
  }, [fetchUser])

  const totalDue = cards.reduce((acc, card) => acc + card.outstandingAmount, 0)

  const calculateMonthlyPayments = (cards: CardType[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return cards.reduce((total, card) => {
      // If the card is paid and has a paidAmount
      if (card.isPaid && card.paidAmount) {
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

  // Update the getDueDate function to set all due dates to March 31, 2025
  const getDueDate = (billingDate: string) => {
    // For now, return March 31, 2025 for all cards
    return new Date(2025, 2, 31); // Month is 0-indexed, so 2 = March
  }
  
  // Update the formatDueDate function to format this fixed date
  const formatDueDate = (billingDate: string) => {
    const dueDate = getDueDate(billingDate);
    return format(dueDate, 'dd MMM yyyy');
  }
  
  // Update the getDaysRemaining function to calculate days until March 31
  const getDaysRemaining = (billingDate: string) => {
    const dueDate = getDueDate(billingDate);
    const today = new Date();
    return Math.max(0, differenceInDays(dueDate, today));
  }
  
  // Handle marking a card as paid
  const handlePayNow = async (cardId: string, amount: number) => {
    try {
      const card = cards.find(c => c._id === cardId)
      if (!card) return
      
      const updatedCard = {
        ...card,
        isPaid: true,
        outstandingAmount: 0,
        paymentHistory: [
          ...(card.paymentHistory || []),
          {
            amount: amount,
            date: new Date().toISOString(),
            billingMonth: format(new Date(), 'MMMM yyyy')
          }
        ]
      }
      
      const response = await axios.put(`/api/cards/${cardId}`, updatedCard)
      
      if (response.data.success) {
        toast.success(`Payment of ₹${amount.toLocaleString()} marked as complete`)
        
        // Update local state
        setCards(prevCards => 
          prevCards.map(c => c._id === cardId ? response.data.data : c)
        )
        
        // Update upcoming payments
        setUpcomingPayments(prevPayments => 
          prevPayments.filter(p => p._id !== cardId)
        )
        
        // Update recently paid
        setRecentlyPaid(prevPaid => [response.data.data, ...prevPaid].slice(0, 3))
      }
    } catch (error) {
      console.error("Error marking payment:", error)
      toast.error("Failed to process payment")
    }
  }
  
  // Navigate to card details
  const navigateToCard = (cardId: string) => {
    router.push(`/cards?id=${cardId}`)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex flex-col bg-[#1c1c28] text-white min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}</p>
        </div>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profilePicture} alt={user?.fullName} />
          <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </header>

      <main className="flex-1 overflow-hidden px-4 pb-20">
        <div className="max-w-7xl mx-auto py-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#252536] rounded-lg mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                Transactions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="mb-6">
                {/* Keep calculations but remove UI */}
                {/* These calculations are still being used but not displayed */}
                {/* totalDue calculation */}
                {/* percentageChange calculation */}
                {/* calculateMonthlyPayments calculation */}
              </div>

              {/* Replace with this: */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Payments</h2>
                
                <div className="space-y-4">
                  {upcomingPayments.length > 0 ? (
                    upcomingPayments.map((card) => (
                      <Card key={card._id} className="bg-[#252536] border-gray-700 overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-stretch">
                            {/* Card color strip */}
                            <div className={`w-2 ${getCardStyle(card.cardName)}`}></div>
                            
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{card.cardName}</h3>
                                  <p className="text-sm text-gray-400">{card.bankName}</p>
                                </div>
                                <div>
                                  <p className="font-bold text-lg">₹{card.outstandingAmount.toLocaleString()}</p>
                                  <div className="flex items-center justify-end">
                                    <p className="text-xs text-gray-400">Due: {formatDueDate(card.billingDate)}</p>
                                    {getDaysRemaining(card.billingDate) <= 5 && (
                                      <AlertCircle className="w-4 h-4 ml-1 text-red-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Credit Utilization Progress Bar */}
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-xs text-gray-400">Credit Utilization</p>
                                  <p className={`text-xs font-medium ${
                                    (card.outstandingAmount / card.cardLimit) * 100 > 80 
                                      ? 'text-red-400' 
                                      : (card.outstandingAmount / card.cardLimit) * 100 > 50 
                                        ? 'text-yellow-400' 
                                        : 'text-green-400'
                                  }`}>
                                    {Math.round((card.outstandingAmount / card.cardLimit) * 100)}%
                                  </p>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      (card.outstandingAmount / card.cardLimit) * 100 > 80 
                                        ? 'bg-red-500' 
                                        : (card.outstandingAmount / card.cardLimit) * 100 > 50 
                                          ? 'bg-yellow-500' 
                                          : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.round((card.outstandingAmount / card.cardLimit) * 100))}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className={`mt-3 text-sm ${
                                getDaysRemaining(card.billingDate) <= 3 
                                  ? 'text-red-400' 
                                  : getDaysRemaining(card.billingDate) <= 7 
                                    ? 'text-yellow-400' 
                                    : 'text-green-400'
                              }`}>
                                {getDaysRemaining(card.billingDate)} days remaining
                              </div>
                              
                              <div className="mt-3">
                                <Button 
                                  onClick={() => handlePayNow(card._id, card.outstandingAmount)}
                                  className="bg-purple-700 hover:bg-purple-600 text-white"
                                >
                                  Pay Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-[#252536] border-gray-700">
                      <CardContent className="p-6 flex flex-col items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                        <p className="text-center text-gray-400">All caught up! No pending payments.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card className="border-none bg-[#252536]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, allTransactions.length)} of {allTransactions.length} transactions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {getPaginatedTransactions().map((transaction, index) => (
                      <TransactionItem
                        key={index}
                        icon={<CreditCard className="h-4 w-4" />}
                        name={`${transaction.cardName} (${transaction.bankName})`}
                        date={format(new Date(transaction.date), 'dd MMMM')}
                        time={format(new Date(transaction.date), 'hh:mm a')}
                        amount={`₹${transaction.amount.toLocaleString()}`}
                      />
                    ))}
                  </div>
                  
                  {allTransactions.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-gray-400">No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Transaction Analytics */}
              <Card className="border-none bg-[#252536] mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Transaction Analytics</CardTitle>
                  <CardDescription>
                    Your payment patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={spendingTrends.slice(0, 6)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#252536', borderColor: '#333' }}
                          labelStyle={{ color: 'white' }}
                        />
                        <Legend />
                        <Bar dataKey="spending" name="Payments" fill="#EC4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1c1c28] border-t border-gray-800 py-3 px-6 flex justify-between items-center">
        <div className="flex flex-col items-center">
          <div className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className="text-xs text-emerald-500 font-medium">Home</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
          </div>
          <span className="text-xs text-gray-400">Statistics</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
