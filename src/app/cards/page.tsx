'use client'

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AddCardModal } from "@/components/AddCardModal"
import { EditCardModal } from "@/components/EditCardModal"
import { Bell, Trash2, Pencil, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserType } from "@/app/profile/page"
import Image from "next/image"
import { motion } from "framer-motion"

export interface CardType {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: string;
  outstandingAmount: number;
  cardNumber?: string;
}

const CardDisplay = ({ card, isActive }: { card: CardType; isActive: boolean }) => {
  const getCardStyle = (cardName: string) => {
    const name = cardName.toLowerCase()
    if (name.includes('infinia')) return 'bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-500'
    if (name.includes('amazon')) return 'bg-gradient-to-tr from-red-500 to-yellow-900'
    if (name.includes('tata')) return 'bg-gradient-to-br from-purple-800 via-purple-900 to-teal-500'
    if (name.includes('play')) return 'bg-gradient-to-tr from-orange-300 via-orange-500 to-red-500'
    if (name.includes('ixigo')) return 'bg-gradient-to-tr from-rose-400 to-red-500'
    if (name.includes('power')) return 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800'
    if (name.includes('platinum') && name.includes('travel')) return 'bg-gradient-to-br from-gray-400 via-dark-700 to-dark-500'
    if (name.includes('simply')) return 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-700'
    if (name.includes('gold') || name.includes('mrcc')) return 'bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-700'
    return 'bg-gradient-to-tr from-gray-500 via-teal-600 to-gray-700' // default style
  }

  const cardStyle = getCardStyle(card.cardName)

  return (
    <motion.div 
      className={`h-44 w-46 rounded-xl shadow-lg overflow-hidden ${cardStyle}`}
      initial={{ scale: 0.9, opacity: 0.7 }}
      animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.7 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 flex flex-col justify-between h-full">
        <div>
          <h2 className="text-xl font-bold text-white">{card.cardName}</h2>
          <p className="text-sm text-white opacity-80">{card.bankName}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-white opacity-80">Due</p>
            <p className="text-lg font-semibold text-white">₹{card.outstandingAmount.toLocaleString()}</p>
          </div>
          <p className="text-white">•••• {card.cardNumber?.slice(-4) || 'XXXX'}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function CardsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

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

  const totalOutstanding = cards.reduce((acc, card) => acc + card.outstandingAmount, 0)
  // const totalCreditLimit = cards.reduce((acc, card) => acc + card.cardLimit, 0)
  

  const changeActiveCard = useCallback((direction: 'next' | 'prev') => {
    setActiveCardIndex((currentIndex) => {
      if (direction === 'next') {
        return currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
      } else {
        return currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
      }
    });
  }, [cards.length]);

  const handleNextCard = useCallback(() => changeActiveCard('next'), [changeActiveCard]);
  const handlePrevCard = useCallback(() => changeActiveCard('prev'), [changeActiveCard]);

  useEffect(() => {
    console.log('Active Card Index:', activeCardIndex); // Debugging log
  }, [activeCardIndex]);

  return (
    <div className="flex flex-col bg-[#1c1c28] text-white rounded-3xl">
      <header className="p-4 flex justify-between items-center">
        <ChevronLeft className="w-4 h-4" />
        <h1 className="text-xl font-bold">Your Cards</h1>
        <Bell className="w-4 h-4" />
      </header>

      <main className="flex-1 overflow-hidden p-4">
        <div className="relative mb-1">
          <div id="card-carousel" className="h-48 overflow-hidden">
            <button 
              onClick={handlePrevCard} 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-900 bg-opacity-30 rounded-r-full p-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex transition-transform duration-300 ease-in-out" 
                 style={{ transform: `translateX(-${activeCardIndex * 100}%)` }}>
              {cards.map((card, index) => (
                <div
                  key={card._id}
                  className="w-full flex-shrink-0 px-4"
                  style={{ transform: `scale(${index === activeCardIndex ? 1 : 0.9})` }}
                >
                  <CardDisplay card={card} isActive={index === activeCardIndex} />
                </div>
              ))}
            </div>
            <button 
              onClick={handleNextCard} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 bg-opacity-50 rounded-l-full p-2"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === activeCardIndex ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center">
          <Button 
            onClick={() => setIsAddCardModalOpen(true)} 
            className="bg-gray-700 hover:bg-gray-600 p-8 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {cards[activeCardIndex] && (
          <div className="bg-gray-800 rounded-lg p-4 shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">{cards[activeCardIndex].cardName}</h3>
            <p className="text-sm mb-2">Credit Limit: ₹{cards[activeCardIndex].cardLimit.toLocaleString()}</p>
            <p className="text-sm mb-2">Due Date: {new Date(cards[activeCardIndex].billingDate).toLocaleDateString()}</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => handleEditCard(cards[activeCardIndex])} size="sm" variant="outline">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button onClick={() => handleDeleteCard(cards[activeCardIndex]._id)} size="sm" variant="outline" className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        )}
        <Button 
          onClick={() => setIsAddCardModalOpen(true)} 
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Card
        </Button>
      </main>

      {/* Modals */}
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
