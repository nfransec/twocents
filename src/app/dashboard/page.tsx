'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronRight, ChevronLeft, Search, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, ArrowDown, BarChart3, PieChart, TrendingUp, Calendar, Pencil, Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import { format, parse, subMonths } from 'date-fns'
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

  // Get upcoming payments
  const getUpcomingPayments = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    return cards
      .filter(card => !card.isPaid && card.outstandingAmount > 0)
      .map(card => {
        // Parse billing date to get the day
        let paymentDay = 5; // Default
        try {
          if (card.billingDate) {
            const billingDate = new Date(card.billingDate);
            paymentDay = billingDate.getDate();
          }
        } catch (e) {
          console.error('Error parsing billing date:', e);
        }
        
        // Create payment due date (same day next month)
        const dueDate = new Date();
        dueDate.setDate(paymentDay);
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        
        return {
          cardName: card.cardName,
          bankName: card.bankName,
          amount: card.outstandingAmount,
          dueDate
        };
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const upcomingPayments = getUpcomingPayments();

  const handleUpdateIncome = async () => {
    try {
      const newIncome = parseFloat(tempIncome)
      if (isNaN(newIncome) || newIncome < 0) {
        toast.error('Please enter a valid income amount')
        return
      }
      
      // Here you would typically make an API call to update the income
      // For example: await axios.post('/api/user/update-income', { income: newIncome })
      
      setIncome(newIncome)
      setIsEditingIncome(false)
      toast.success('Income updated successfully')
    } catch (error) {
      console.error('Error updating income:', error)
      toast.error('Failed to update income')
    }
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none bg-gradient-to-r from-emerald-500 to-teal-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">Total Income</CardTitle>
                    <Wallet className="h-4 w-4 text-white opacity-70" />
                  </CardHeader>
                  <CardContent>
                    {isEditingIncome ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-800">₹</span>
                          <Input
                            className="pl-6 bg-emerald-400/50 border-emerald-300 text-white placeholder:text-emerald-100"
                            placeholder="Enter income"
                            value={tempIncome}
                            onChange={(e) => setTempIncome(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 bg-emerald-400/50 hover:bg-emerald-400/70 text-white"
                          onClick={handleUpdateIncome}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 bg-emerald-400/50 hover:bg-emerald-400/70 text-white"
                          onClick={() => setIsEditingIncome(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-white">₹{income.toLocaleString()}</div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 bg-emerald-400/30 hover:bg-emerald-400/50 text-white"
                            onClick={() => {
                              setTempIncome(income.toString())
                              setIsEditingIncome(true)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center mt-1">
                          <ArrowUpRight className="h-4 w-4 text-emerald-100" />
                          <span className="text-xs text-emerald-100 ml-1">+12% from last month</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-none bg-gradient-to-r from-rose-500 to-red-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">Total Due</CardTitle>
                    <CreditCard className="h-4 w-4 text-white opacity-70" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalDue.toLocaleString()}</div>
                    <div className="flex items-center mt-1">
                      {percentageChange > 0 ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-red-100" />
                          <span className="text-xs text-red-100 ml-1">
                            +{percentageChange.toFixed(1)}% from last month
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-green-100" />
                          <span className="text-xs text-green-100 ml-1">
                            {percentageChange.toFixed(1)}% from last month
                          </span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-none bg-gradient-to-r from-purple-600 to-indigo-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">Monthly Payments</CardTitle>
                    <Calendar className="h-4 w-4 text-white opacity-70" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ₹{calculateMonthlyPayments(cards).toLocaleString()}
                    </div>
                    <p className="text-xs text-purple-100 mt-1">
                      Total credit card payments this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Spending Trends Chart */}
              <Card className="border-none bg-[#252536]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    Spending Trends
                  </CardTitle>
                  <CardDescription>
                    Your financial activity over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={spendingTrends}
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
                        <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="spending" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Spending by Category */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none bg-[#252536]">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <PieChart className="mr-2 h-5 w-5 text-primary" />
                      Spending by Category
                    </CardTitle>
                    <CardDescription>
                      Where your money goes each month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                            contentStyle={{ backgroundColor: '#252536', borderColor: '#333' }}
                            labelStyle={{ color: 'white' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Payments */}
                <Card className="border-none bg-[#252536]">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-primary" />
                      Upcoming Payments
                    </CardTitle>
                    <CardDescription>
                      Bills due in the next 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingPayments.length > 0 ? (
                        upcomingPayments.slice(0, 4).map((payment, index) => (
                          <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-3 last:border-0">
                            <div>
                              <p className="font-medium">{payment.cardName}</p>
                              <p className="text-sm text-gray-400">{payment.bankName}</p>
                              <p className="text-xs text-gray-500">Due {format(payment.dueDate, 'dd MMM yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-rose-500">₹{payment.amount.toLocaleString()}</p>
                              <Button variant="outline" size="sm" className="mt-1 h-7 text-xs">
                                Pay Now
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 py-6">No upcoming payments</p>
                      )}
                      
                      {upcomingPayments.length > 4 && (
                        <Button variant="ghost" className="w-full text-primary">
                          View All ({upcomingPayments.length})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Credit Card Utilization */}
              <Card className="border-none bg-[#252536]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Credit Card Utilization
                  </CardTitle>
                  <CardDescription>
                    How much of your available credit you're using
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cards.map((card) => {
                      const utilization = (card.outstandingAmount / card.cardLimit) * 100;
                      let utilizationColor = 'bg-green-500';
                      if (utilization > 30 && utilization <= 70) {
                        utilizationColor = 'bg-yellow-500';
                      } else if (utilization > 70) {
                        utilizationColor = 'bg-red-500';
                      }
                      
                      return (
                        <div key={card._id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{card.cardName}</p>
                              <p className="text-xs text-gray-400">{card.bankName}</p>
                            </div>
                            <p className="text-sm font-semibold">
                              {utilization.toFixed(0)}% used
                            </p>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${utilizationColor}`}
                              style={{ width: `${Math.min(100, utilization)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>₹{card.outstandingAmount.toLocaleString()}</span>
                            <span>₹{card.cardLimit.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
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
