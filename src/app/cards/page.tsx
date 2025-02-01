'use client'

import { useState, useEffect, useCallback } from "react"
import { useGesture } from "react-use-gesture"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AddCardModal } from "@/components/AddCardModal"
import { EditCardModal } from "@/components/EditCardModal"
import { Bell, Trash2, Pencil, ChevronLeft, ChevronRight, Plus, Banknote, HelpCircle, Calendar, Lock, CheckCircle, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserType } from "@/app/profile/page"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { PaymentScheduler } from '@/components/PaymentScheduler'

export interface CardType {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: string;
  outstandingAmount: number;
  cardNumber?: string;
  cvv?: string;
  isPaid?: boolean;
  paidAmount?: number;
  paymentDate?: string;
  imageUrl?: string;
}

const CardDisplay = ({ card, isActive, index, activeIndex }: { card: CardType; isActive: boolean; index: number; activeIndex: number }) => {
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
      className={`h-44 w-72 rounded-xl shadow-lg overflow-hidden ${cardStyle} absolute`}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ 
        scale: isActive ? 1 : 0.8, 
        opacity: isActive ? 1 : 0.5,
        x: `${(index - activeIndex) * 70}%`,
        zIndex: isActive ? 10 : 0
      }}
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)

  const handleError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    } else {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  }, [router]);

  const fetchCards = async () => {
    try {
      const response = await axios.get('/api/cards');
      if (response.data.success) {
        setCards(response.data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getUserDetails = async () => {
    try {
      const response = await axios.get('/api/user');
      if (response.data.success) {
        setCurrentUser(response.data.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    getUserDetails();
  }, []);

  const handleAddCard = async (newCard: Omit<CardType, '_id'>) => {
    try {
      const response = await axios.post('/api/cards', newCard);
      if (response.data.success) {
        setCards([...cards, response.data.data]);
        setIsAddModalOpen(false);
        toast.success('Card added successfully');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditClick = (card: CardType) => {
    setSelectedCard(card);
    setIsEditModalOpen(true);
  };

  const handleUpdateCard = useCallback(async (updatedCard: CardType) => {
    try {
      const cardToUpdate = {
        ...updatedCard,
        isPaid: updatedCard.outstandingAmount === 0,
        paidAmount: updatedCard.outstandingAmount === 0 ? updatedCard.outstandingAmount : 0
      };

      const response = await axios.put(`/api/cards/${updatedCard._id}`, cardToUpdate);
      
      if (response.data.success) {
        const newCards = [...cards];
        const index = cards.findIndex(card => card._id === updatedCard._id);
        newCards[index] = response.data.data;
        setCards(newCards);
        setIsEditModalOpen(false);
        toast.success('Card updated successfully');
      }
    } catch (error) {
      handleError(error);
    }
  }, [cards, handleError]);

  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await axios.delete(`/api/cards?_id=${cardId}`);
        setCards(cards.filter(card => card._id !== cardId));
        toast.success('Card deleted successfully');
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleNextCard = useCallback(() => {
    setActiveCardIndex((currentIndex) => (currentIndex + 1) % cards.length);
  }, [cards.length]);

  const handlePrevCard = useCallback(() => {
    setActiveCardIndex((currentIndex) => (currentIndex - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const formattedBillingDate = cards[activeCardIndex]?.billingDate
    ? format(new Date(cards[activeCardIndex]?.billingDate), 'dd MMM')
    : '**/99';

  const topSpendingCard = cards.reduce((prev, current) => {
    return (prev.outstandingAmount > current.outstandingAmount) ? prev : current;
  }, cards[0]);

  const handlePayment = async (cardId: string, amount: number) => {
    try {
      console.log('Before payment:', cards[activeCardIndex]); // Debug log
      const response = await axios.put(`/api/cards/${cardId}`, {
        ...cards[activeCardIndex],
        isPaid: true,
        paidAmount: amount,
        outstandingAmount: 0,
        paymentDate: new Date().toISOString()
      });

      if (response.data.success) {
        const updatedCards = [...cards];
        updatedCards[activeCardIndex] = response.data.data;
        setCards(updatedCards);
        toast.success('Card marked as paid successfully');
        console.log('After payment:', response.data.data); // Debug log
      }
    } catch (error) {
      console.error('Error marking card as paid:', error);
      toast.error('Failed to mark card as paid');
    }
  };

  return (
    <div className="flex flex-col bg-[#1c1c28] text-white min-h-screen">
      <div className='flex items-center justify-between p-4 bg-zinc-900'>
        <h1 className='font-extrabold'>Manage your cards</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      <header className="p-4 flex justify-between items-center">
        <ChevronLeft className="w-4 h-4" />
        <h1 className="text-xl font-bold">My Cards</h1>
        <Bell className="w-4 h-4" />
      </header>

      <main className="flex-1 overflow-hidden px-4">
        <div className="relative mb-4 h-48">
          <div className="overflow-visible h-full flex items-center justify-center">
            {cards.map((card, index) => (
              <CardDisplay
                key={card._id}
                card={card}
                isActive={index === activeCardIndex}
                index={index}
                activeIndex={activeCardIndex}
              />
            ))}
          </div>
          <button 
            onClick={handlePrevCard} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-gray-800 bg-opacity-50 rounded-full p-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNextCard} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-gray-800 bg-opacity-50 rounded-full p-2"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === activeCardIndex ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {cards[activeCardIndex] && (
          <Card className="border-none bg-gradient-to-r from-slate-800 to-slate-700 text-white">
            <CardContent className="p-4">
              <h2 className="text-md font-semibold">More Details</h2>
              <span className="text-sm text-emerald-400">{cards[activeCardIndex].cardName}</span>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-gray-400" />
                    <span>CVV</span>
                  </div>
                  <span className="font-semibold">{cards[activeCardIndex].cvv || '***'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Due Date</span>
                  </div>
                  <span className="font-semibold">{formattedBillingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Banknote className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Available</span>
                  </div>
                  <span className="font-semibold">₹ {(cards[activeCardIndex].cardLimit - cards[activeCardIndex].outstandingAmount).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => handleEditClick(cards[activeCardIndex])} 
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={() => handleDeleteCard(cards[activeCardIndex]._id)} 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white mb-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <div className="flex justify-center">
                <Button
                  className={`w-full ${
                    cards[activeCardIndex]?.outstandingAmount === 0 
                      ? 'bg-green-600/20 text-green-300 cursor-not-allowed hover:bg-green-600/20'
                      : 'bg-purple-700 hover:bg-purple-600'
                  }`}
                  disabled={cards[activeCardIndex]?.outstandingAmount === 0}
                  onClick={() => handlePayment(cards[activeCardIndex]._id, cards[activeCardIndex].outstandingAmount)}
                >
                  {cards[activeCardIndex]?.outstandingAmount === 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="font-bold">Paid</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h3 className="text-md font-semibold mb-2">Payment Schedule</h3>
                <PaymentScheduler 
                  card={cards[activeCardIndex]} 
                  onUpdate={(updatedCard) => {
                    setCards(prevCards =>
                      prevCards.map(card =>
                        card._id === updatedCard._id ? updatedCard : card
                      )
                    )
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        )}

        {topSpendingCard && (
          <Card className="border-none bg-gradient-to-r from-slate-800 to-slate-700 text-white mt-4">
            <CardContent className="p-4">
              <h2 className="text-md font-semibold">Top Card 🎉</h2>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">{topSpendingCard.cardName}</h2>
                  <span className="text-2xl text-emerald-400">₹ {topSpendingCard.outstandingAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <AddCardModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCard={handleAddCard}
      />
      {selectedCard && (
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCard(null);
          }}
          onEdit={handleUpdateCard}
          card={selectedCard}
        />
      )}
    </div>
  )
}
