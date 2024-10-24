'use client'

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AddCardModal } from "@/components/AddCardModal"
import { EditCardModal } from "@/components/EditCardModal"
import { Bell, Trash2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserType } from "@/app/profile/page"
import Image from "next/image"

export interface CardType {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: string;
  outstandingAmount: number;
  cardNumber?: string;
}

const CardDesign = ({ card }: { card: CardType }) => {
  const getCardStyle = (cardName: string) => {
    const name = cardName.toLowerCase()
    if (name.includes('infinia')) return 'bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-500'
    if (name.includes('amazon')) return 'bg-gradient-to-tr from-red-500 via-yellow-900 to-dark-200'
    if (name.includes('tata') || name.includes('american express')) return 'bg-gradient-to-r from-green-500 to-teal-500'
    if (name.includes('play')) return 'bg-gradient-to-r from-orange-500 to-red-500'
    if (name.includes('simply')) return 'bg-gradient-to-r from-blue-400 to-blue-600'
    return 'bg-gradient-to-tr from-gray-500 via-teal-600 to-gray-700' // default style
  }

  const cardStyle = getCardStyle(card.cardName)

  return (
    <div className={`relative w-full h-60 rounded-lg shadow-lg overflow-hidden ${cardStyle}`}>
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-white">{card.bankName === 'American Express' ? 'American Express' : card.bankName.split(' ')[0]}</h2>
          {/* <p className="text-sm mb-4 text-white opacity-80">{card.bankName}</p> */}
        </div>
        <div className="flex flex-col items-start gap-4">
          <div>
            <p className="text-sm text-white opacity-80">Total Due</p>
            <p className={`text-lg font-semibold ${card.outstandingAmount > 10000 ? "text-red-900" : "text-green-900"}`}>
              ₹{card.outstandingAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-white opacity-80">Due Date</p>
            <p className="text-lg font-semibold text-white">{new Date(card.billingDate).getDate()}</p>
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <span className="text-white text-2xl font-bold">
            {card.cardName.split(' ')[0].toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CardsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)

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
  

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card)
  }

  const handlePrevCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : cards.length - 1))
  }

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : 0))
  }

  const handleCardScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 0) {
      setSelectedCardIndex((prev) => (prev + 1) % cards.length)
    } else {
      setSelectedCardIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
  }

  return (
    <div className="flex flex-col min-h-screen text-white pb-16 md:pb-0 bg-dark-300">
      <header className="shadow-sm bg-dark-300">
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
      <main className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-6">
            <p className="text-md text-gray-400 font-semibold">Total Outstanding: <br />
              <span className={totalOutstanding > 50000 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>₹{totalOutstanding.toLocaleString()}</span></p>
            {/* <h2 className="text-md text-gray-400 font-bold">Total Credit Limit: ₹{totalCreditLimit.toLocaleString()}</h2> */}
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => setIsAddCardModalOpen(true)}>Add New Card</Button>
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <CardDesign key={card._id} card={card} />
            ))}
          </div>

          {/* Mobile view */}
          <div className="md:hidden">
            <div 
              className="relative h-80 overflow-hidden"
              onWheel={handleCardScroll}
            >
              {cards.map((card, index) => {
                const distance = index - selectedCardIndex;
                const absoluteDistance = Math.abs(distance);
                const isBeforeSelected = distance < 0;

                return (
                  <div
                    key={card._id}
                    className={`absolute w-full transition-all duration-300 ease-in-out`}
                    style={{
                      transform: `
                        translateY(${distance * 30}%)
                        scale(${1 - absoluteDistance * 0.1})
                        translateZ(${isBeforeSelected ? '-' : ''}${absoluteDistance * 10}px)
                      `,
                      opacity: 1 - absoluteDistance * 0.2,
                      zIndex: cards.length - absoluteDistance,
                    }}
                  >
                    <CardDesign card={card} />
                  </div>
                );
              })}
            </div>

            {cards[selectedCardIndex] && (
              <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">{cards[selectedCardIndex].cardName}</h3>
                <p className="mb-2">Bank: {cards[selectedCardIndex].bankName}</p>
                <p className="mb-2">Credit Limit: ₹{cards[selectedCardIndex].cardLimit.toLocaleString()}</p>
                <p className="mb-2">Outstanding: ₹{cards[selectedCardIndex].outstandingAmount.toLocaleString()}</p>
                <p className="mb-4">Billing Date: {new Date(cards[selectedCardIndex].billingDate).toLocaleDateString()}</p>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button onClick={() => handleEditCard(cards[selectedCardIndex])} size="sm" className="bg-blue-500 hover:bg-blue-600">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteCard(cards[selectedCardIndex]._id)} size="sm" className="bg-red-500 hover:bg-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
