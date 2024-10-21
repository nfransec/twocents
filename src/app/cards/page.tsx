'use client'

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AddCardModal } from "@/components/AddCardModal"
import { EditCardModal } from "@/components/EditCardModal"
import { Bell, Trash2, Pencil } from "lucide-react"
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
  imageUrl?: string;
}

export default function CardsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)

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

  const handleAddCard = async (newCard: Omit<CardType, '_id'>) => {
    try {
      console.log('Sending new card data:', newCard);
      const response = await axios.post('/api/cards', newCard);
      console.log('Server response:', response.data);
      setCards([...cards, response.data.data]);
      toast.success('Card added successfully');
    } catch (error) {
      console.error('Error adding card:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server error response:', error.response.data);
      }
      toast.error('Failed to add card');
    }
  }

  const handleEditCard = (card: CardType) => {
    setEditingCard(card)
  }

  const handleSaveEditedCard = async (editedCard: Partial<CardType>) => {
    try {
      const response = await axios.put(`/api/cards`, editedCard)
      setCards(cards.map(card => card._id === editedCard._id ? response.data.data : card))
      toast.success('Card updated successfully')
    } catch (error) {
      console.error('Error updating card:', error)
      toast.error('Failed to update card')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await axios.delete(`/api/cards?_id=${cardId}`)
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
    <div className="flex flex-col min-h-screen text-white pb-16 md:pb-0 bg-gray-900">
      <header className="shadow-sm bg-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">My Cards</h1>
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
      <main className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => setIsAddCardModalOpen(true)}>Add New Card</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div key={card._id} className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="credit-card bg-gradient-to-br from-purple-600 to-blue-500">
                      <div className="credit-card-content">
                        <h3 className="text-xl font-bold mb-2">{card.cardName}</h3>
                        <p className="text-sm mb-4">{card.bankName}</p>
                        <p className="text-lg">
                          •••• •••• •••• {card.cardNumber ? card.cardNumber.slice(-4) : 'XXXX'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flip-card-back">
                    <div className="credit-card bg-gradient-to-br from-gray-700 to-gray-900">
                      <div className="credit-card-content">
                        <p>Limit: ₹{card.cardLimit || 'N/A'}</p>
                        <p>Billing Date: {card.billingDate || 'N/A'}</p>
                        <p>Outstanding: ₹{card.outstandingAmount || 'N/A'}</p>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button onClick={() => handleEditCard(card)} size="sm" className="bg-blue-500 hover:bg-blue-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDeleteCard(card._id)} size="sm" className="bg-red-500 hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {isAddCardModalOpen && (
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onAddCard={handleAddCard}
        />
      )}
      {editingCard && (
        <EditCardModal
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          onEditCard={handleSaveEditedCard}
          card={editingCard}
        />
      )}
    </div>
  )
}
