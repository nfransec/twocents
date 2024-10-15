'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/ui/icons"
import { CreditCard, Edit, LogOut, Settings, User } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { LineChart, Line } from "recharts"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchCards()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/users/me')
      setUser(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch user data")
    }
  }

  const fetchCards = async () => {
    try {
      const response = await axios.get('/api/cards')
      setCards(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch cards")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axios.get('/api/users/logout')
      router.push('/login')
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const totalOutstanding = cards.reduce((sum, card) => sum + card.outstandingAmount, 0)
  const mostUsedCard = cards.length > 0 
  ? cards.reduce((prev, current) => (prev.outstandingAmount > current.outstandingAmount ? prev : current))
  : null;

  const totalCreditLimit = cards.reduce((sum, card) => sum + card.cardLimit, 0)
  const creditUtilizationRatio = (totalOutstanding / totalCreditLimit) * 100

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.fullName}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png" alt={user?.fullName} />
                <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/cards')}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Cards</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={totalOutstanding > 50000 ? "text-3xl font-bold text-red-700" : 'text-3xl font-bold text-yellow-600'}>₹{totalOutstanding.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Credit Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalCreditLimit.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credit Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{creditUtilizationRatio.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Used Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{mostUsedCard.cardName}</p>
            <p className="text-sm text-red-700">{mostUsedCard.bankName}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Card</CardTitle>
          </CardHeader>
          <CardContent>
          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cards}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cardName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="outstandingAmount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>Credit Utilization by Card</CardTitle>
          </CardHeader>
          <CardContent>
          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cards}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cardName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="outstandingAmount" fill="#8884d8" name="Outstanding" />
                <Bar dataKey="cardLimit" fill="#82ca9d" name="Limit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}