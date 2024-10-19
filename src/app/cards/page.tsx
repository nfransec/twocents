'use client'

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddCardModal, AddCardModalProps } from "@/components/AddCardModal"
import { Bell, CreditCard, FileText, HelpCircle, Home, LogOut, Trash2, Pencil, User } from "lucide-react"
import CustomSidebar from "@/components/customSidebar"
import CustomFormField from "@/components/CustomFormField"
import { FormFieldType } from "@/components/forms/UserForm"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { UserType } from "@/app/profile/page"


export interface CardType {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: string;
  outstandingAmount: number;
  imageUrl: string;
}

export default function CardsPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)

  useEffect(() => {
    fetchCards()
    getUserDetails()
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

  const handleAddCard = (newCard: CardType) => {
    setCards([...cards, newCard])
  }

  const handleEditCard = (cardId: string) => {
    setEditingCard(cardId)
    // Implement edit functionality
  }

  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await axios.delete(`/api/cards/${cardId}`)
        setCards(cards.filter(card => card._id !== cardId))
        toast.success('Card deleted successfully')
      } catch (error) {
        console.error('Error deleting card:', error)
        toast.error('Failed to delete card')
      }
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
  const getUserDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      const userData = res.data.data
      setCurrentUser(userData)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    <div className="flex h-screen text-white pl-16 md:pl-64 relative">
        <CustomSidebar />
        <div className="flex-1 overflow-auto">
            <header className="shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white mt-4">My Cards</h1>
                    <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-400 mr-4" />
                        <div className="flex items-center">
                            <Image 
                                src="/assets/icons/user2.svg" 
                                alt="Profile" 
                                width={32} 
                                height={32} 
                                className="rounded-full mr-2" 
                            />
                            <span className="text-sm font-medium text-white">
                                Hello,
                                <span className="font-bold text-green-500"> {currentUser?.fullName?.split(' ')[0]}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex flex-row justify-end mr-4 sm:mr-0">
                    <Button className="bg-green-500" onClick={() => setIsAddCardModalOpen(true)}>Add New Card</Button>
                </div>
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Cards section */}
                        <div className="flex-1">
                            <Card className="flex-1">
                                <CardHeader>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {cards.map((card) => (
                                            <Card key={card._id}>
                                                <CardHeader>
                                                    <CardTitle>{card.cardName}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>Bank: {card.bankName}</p>
                                                    <p>Limit: ₹{card.cardLimit}</p>
                                                    <p>Billing Date: {card.billingDate}</p>
                                                    <p>Outstanding: ₹{card.outstandingAmount}</p>
                                                    <div className="flex justify-end mt-4 space-x-2">
                                                        <Button onClick={() => handleEditCard(card._id)} size="sm">
                                                        <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button onClick={() => handleDeleteCard(card._id)} size="sm" variant="destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-white hover:bg-gray-700"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 hidden md:inline md:text-lg"><LogOut/>Logout</span>
          </Button>
        </div>
    </div>
  )
}
