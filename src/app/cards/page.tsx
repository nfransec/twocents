'use client'

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AddCardModal } from "@/components/AddCardModal"
import { EditCardModal } from "@/components/EditCardModal"
import { ChevronRight, Plus, CreditCard, Wifi, Pencil, Trash2, CheckCircle, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { UserType } from "@/app/profile/page"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import type { CardType } from "@/types/card"
import LoadingScreen from "@/components/LoadingScreen"
import { useGesture } from "react-use-gesture"
import { DeleteCardModal } from "@/components/DeleteCardModal"

// Extract the getCardStyle function from CardDisplay and place it at the component level
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

const CardDisplay = ({
  card,
  isActive,
  index,
  activeIndex,
}: { card: CardType; isActive: boolean; index: number; activeIndex: number }) => {
  const cardStyle = getCardStyle(card.cardName)
  const cardBrand = "VISA"
  const cardType = card.cardName.includes("Debit") ? "Debit" : "Credit"

  return (
    <motion.div
      className={`h-72 w-56 rounded-xl shadow-lg overflow-hidden ${cardStyle} absolute`}
      initial={{ scale: 0.9, opacity: 0.5 }}
      animate={{
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.7,
        x: `${(index - activeIndex) * 120}%`, // card spacing
        zIndex: isActive ? 10 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Wave pattern background */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <svg className="w-full h-full" viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
            fill="white" fillOpacity="0.3" />
        </svg>
      </div>
      
      <div className="p-6 flex flex-col justify-between h-full relative">
        {/* Card brand and type */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-white">{card.cardName === "BookMyShow PLaY" ? "Play" : card.cardName}</h2>
            <p className="text-sm text-white opacity-80">{card.bankName}</p>
          </div>
          
          {/* Chip and contactless */}
          <div className="flex items-center mt-2">
            <div className="w-6 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm flex items-center justify-center">
              {/* EMV chip with portrait orientation */}
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="14" height="18" rx="1" fill="transparent" stroke="#888" strokeWidth="0.5"/>
                <path d="M4 3h8M4 7h8M4 11h8M4 15h8" stroke="#888" strokeWidth="0.5"/>
                <path d="M2 6v8M6 2v16M10 2v16M14 6v8" stroke="#888" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="text-white opacity-80 ml-2">
              {/* Contactless payment symbol using Lucide Wifi icon */}
              <Wifi className="w-4 h-4 transform rotate-90" />
            </div>
          </div>
        </div>

        {/* Middle section - empty space */}
        <div className="flex-grow"></div>

  
        <div className="mt-auto">
          {/* <p className="text-md text-white">Due:</p> */}
          <p className="text-white">₹{card.outstandingAmount.toLocaleString()}</p>
        </div>
        
        {/* Card number */}
        {/* <div className="mt-4">
          <p className="text-white text-sm">•••• {card.cardNumber?.slice(-4) || "XXXX"}</p>
        </div> */}
        
        {/* Bank logo */}
        <div className="absolute bottom-6 right-6">
          <div className="flex items-center">
            {/* <span className="text-white font-semibold">{card.bankName}</span> */}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CardsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [isDetailView, setIsDetailView] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null)

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleError = useCallback(
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.")
          router.push("/login")
        } else {
          toast.error(error.response?.data?.message || "An error occurred")
        }
      } else {
        console.error("Error:", error)
        toast.error("An unexpected error occurred")
      }
    },
    [router],
  )

  const fetchCards = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("/api/cards")
      if (response.data.success) {
        const processedCards: CardType[] = response.data.data.map((card: any) => ({
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
        setCards(processedCards)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
      toast.error("Failed to fetch cards")
    } finally {
      setIsLoading(false)
    }
  }

  const getUserDetails = useCallback(async () => {
    try {
      const response = await axios.get("/api/user")
      if (response.data.success) {
        setCurrentUser(response.data.data)
      }
    } catch (error) {
      handleError(error)
    }
  }, [handleError])

  useEffect(() => {
    fetchCards()
  }, [])

  useEffect(() => {
    getUserDetails()
  }, [getUserDetails])

  const handleAddCard = async (newCard: Omit<CardType, "_id">) => {
    try {
      const response = await axios.post("/api/cards", newCard)
      if (response.data.success) {
        setCards([...cards, response.data.data])
        setIsAddModalOpen(false)
        toast.success("Card added successfully")
      }
    } catch (error) {
      handleError(error)
    }
  }

  const handleEditClick = (card: CardType) => {
    setSelectedCard(card)
    setIsEditModalOpen(true)
  }

  const handleUpdateCard = useCallback(
    async (updatedCard: CardType) => {
      try {
        const cardToUpdate = {
          ...updatedCard,
          isPaid: updatedCard.outstandingAmount === 0,
          paidAmount: updatedCard.outstandingAmount === 0 ? updatedCard.outstandingAmount : 0,
        }

        const response = await axios.put(`/api/cards/${updatedCard._id}`, cardToUpdate)

        if (response.data.success) {
          const newCards = [...cards]
          const index = cards.findIndex((card) => card._id === updatedCard._id)
          newCards[index] = response.data.data
          setCards(newCards)
          setIsEditModalOpen(false)
          toast.success("Card updated successfully")
        }
      } catch (error) {
        handleError(error)
      }
    },
    [cards, handleError],
  )

  const handleDeleteClick = (card: CardType) => {
    setCardToDelete(card)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCard = async (cardId: string) => {
    try {
      const response = await axios.delete(`/api/cards/${cardId}`)
      if (response.data.success) {
        setCards(cards.filter(c => c._id !== cardId))
      }
      return response.data
    } catch (error) {
      console.error("Error deleting card:", error)
      throw error
    }
  }

  const handleNextCard = useCallback(() => {
    setActiveCardIndex((currentIndex) => {
      // Move to the next card, wrap around if at the end
      return (currentIndex + 1) % cards.length;
    });
  }, [cards.length]);

  const handlePrevCard = useCallback(() => {
    setActiveCardIndex((currentIndex) => {
      // Move to the previous card, wrap around if at the start
      return (currentIndex - 1 + cards.length) % cards.length;
    });
  }, [cards.length]);

  const formattedBillingDate = cards[activeCardIndex]?.billingDate
    ? format(new Date(cards[activeCardIndex]?.billingDate), "dd MMM")
    : "**/99"

  const topSpendingCard = cards.reduce((prev, current) => {
    return prev.outstandingAmount > current.outstandingAmount ? prev : current
  }, cards[0])

  const handlePayment = async (cardId: string, amount: number) => {
    try {
      console.log("Before payment:", cards[activeCardIndex]) // Debug log
      const response = await axios.put(`/api/cards/${cardId}`, {
        ...cards[activeCardIndex],
        isPaid: true,
        paidAmount: amount,
        outstandingAmount: 0,
        paymentDate: new Date().toISOString(),
      })

      if (response.data.success) {
        const updatedCards = [...cards]
        updatedCards[activeCardIndex] = response.data.data
        setCards(updatedCards)
        toast.success("Card marked as paid successfully")
        console.log("After payment:", response.data.data) // Debug log
      }
    } catch (error) {
      console.error("Error marking card as paid:", error)
      toast.error("Failed to mark card as paid")
    }
  }

  const bind = useGesture({
    onDrag: ({ movement: [mx], velocity, direction: [xDir], distance, cancel }) => {
      //console.log("Drag detected:", { mx, velocity, xDir, distance });
      
      if (distance > 50) {
        cancel();
        //console.log("Before change:", activeCardIndex);
        
        if (xDir > 0) {
          // Previous card (right swipe)
          const newIndex = (activeCardIndex - 1 + cards.length) % cards.length;
          //console.log("Moving to previous card:", newIndex);
          setActiveCardIndex(newIndex);
        } else {
          // Next card (left swipe)
          const newIndex = (activeCardIndex + 1) % cards.length;
          //console.log("Moving to next card:", newIndex);
          setActiveCardIndex(newIndex);
        }
      }
    },
  });

  return (
    <div className="flex flex-col bg-[#1c1c28] text-white min-h-screen">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <header className="p-4 flex justify-between items-center relative z-10">
            <AnimatePresence>
              {!isDetailView ? (
                <motion.h1 
                  className="text-2xl font-semibold"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="title"
                >
                  My Cards
                </motion.h1>
              ) : (
                <motion.button
                  className="flex items-center text-white"
                  onClick={() => setIsDetailView(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="back-button"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  <span>Back</span>
                </motion.button>
              )}
            </AnimatePresence>
            
            {!isDetailView && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 rounded-full px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                Add card
              </Button>
            )}
            
            {isDetailView && cards[activeCardIndex] && (
              <motion.div 
                className={`absolute left-1/2 -translate-x-1/2 h-10 w-10 rounded-xl overflow-hidden ${getCardStyle(cards[activeCardIndex].cardName)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Mini card icon */}
              </motion.div>
            )}
          </header>

          <main ref={mainRef} className="flex-1 overflow-hidden px-4 pb-20">
            <AnimatePresence>
              {!isDetailView ? (
                <motion.div
                  key="carousel-view"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative mb-4 h-72 touch-none"
                  {...bind()}
                >
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
                  
                  <div className="flex justify-center mb-6 mt-4">
                    {cards.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 ${index === activeCardIndex ? "bg-emerald-500" : "bg-gray-600"}`}
                        onClick={() => setActiveCardIndex(index)}
                      />
                    ))}
                  </div>

                  {/* Action buttons */}
                  {cards[activeCardIndex] && (
                    <div className="flex justify-center gap-8 mb-6">
                      <div className="flex flex-col items-center">
                        <Button 
                          onClick={() => handleEditClick(cards[activeCardIndex])} 
                          variant="outline"
                          className="w-12 h-12 rounded-full p-0 border-gray-600 hover:bg-[#2c2c40] text-white"
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <span className="text-xs text-white mt-2">Edit</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <Button
                          className={`w-12 h-12 rounded-full p-0 ${
                            cards[activeCardIndex]?.outstandingAmount === 0 
                              ? 'bg-green-600/20 text-green-300 hover:bg-green-600/20 cursor-not-allowed'
                              : 'bg-purple-700 hover:bg-purple-600'
                          }`}
                          disabled={cards[activeCardIndex]?.outstandingAmount === 0}
                          onClick={() => handlePayment(cards[activeCardIndex]._id, cards[activeCardIndex].outstandingAmount)}
                        >
                          {cards[activeCardIndex]?.outstandingAmount === 0 ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <CreditCard className="w-5 h-5" />
                          )}
                        </Button>
                        <span className={`text-xs ${cards[activeCardIndex]?.outstandingAmount === 0 ? "text-green-400" : "text-white"} mt-2`}>
                          {cards[activeCardIndex]?.outstandingAmount === 0 ? "Paid" : "Pay"}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <Button 
                          onClick={() => handleDeleteClick(cards[activeCardIndex])} 
                          variant="outline"
                          className="w-12 h-12 rounded-full p-0 border-red-500 bg-transparent hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <span className="text-xs text-white mt-2">Delete</span>
                      </div>
                    </div>
                  )}

                  {cards[activeCardIndex] && (
                    <Card className="border-none rounded-xl bg-[#252536] text-white mt-6">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
                            <h2 className="text-lg font-semibold">{cards[activeCardIndex].cardName}</h2>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="text-gray-400 hover:text-white hover:bg-[#2c2c40]"
                            onClick={() => {
                              setIsDetailView(true)
                              scrollToTop()
                            }}
                          >
                            More <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-gray-700">
                            <span className="text-purple-400">Card Limit</span>
                            <span className="font-medium">₹{cards[activeCardIndex].cardLimit.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-purple-400">Billing Date</span>
                            <span className="font-medium">{formattedBillingDate}</span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-purple-400">Outstanding Amount</span>
                            <span className="font-medium">₹{cards[activeCardIndex].outstandingAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="detail-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="pt-10"
                >
                  {cards[activeCardIndex] && (
                    <div className="space-y-6">
                      <div className={`h-48 w-full rounded-xl ${getCardStyle(cards[activeCardIndex].cardName)} p-6 relative overflow-hidden`}>
                        {/* Wave pattern background */}
                        <div className="absolute inset-0 w-full h-full opacity-20">
                          <svg className="w-full h-full" viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
                              fill="white" fillOpacity="0.3" />
                          </svg>
                        </div>
                        
                        <div className="flex flex-col justify-between h-full relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-xl font-bold text-white">{cards[activeCardIndex].cardName}</h2>
                              <p className="text-sm text-white opacity-80">{cards[activeCardIndex].bankName}</p>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="w-8 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm flex items-center justify-center">
                                <svg width="20" height="24" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="1" y="1" width="14" height="18" rx="1" fill="transparent" stroke="#888" strokeWidth="0.5"/>
                                  <path d="M4 3h8M4 7h8M4 11h8M4 15h8" stroke="#888" strokeWidth="0.5"/>
                                  <path d="M2 6v8M6 2v16M10 2v16M14 6v8" stroke="#888" strokeWidth="0.5"/>
                                </svg>
                              </div>
                              <div className="text-white opacity-80 ml-2">
                                <Wifi className="w-5 h-5 transform rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <p className="text-white text-lg font-semibold">₹{cards[activeCardIndex].outstandingAmount.toLocaleString()}</p>
                            <p className="text-white text-sm opacity-80">Outstanding Amount</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-[#252536] rounded-xl p-4">
                          <h3 className="text-lg font-semibold mb-4">Card Details</h3>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-purple-400">Card Holder</span>
                              <span className="font-medium">{currentUser?.fullName || "Card Holder"}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-purple-400">Card Number</span>
                              <span className="font-medium">•••• {cards[activeCardIndex].cardNumber?.slice(-4) || "XXXX"}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-purple-400">Card Limit</span>
                              <span className="font-medium">₹{cards[activeCardIndex].cardLimit.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-purple-400">Billing Date</span>
                              <span className="font-medium">{formattedBillingDate}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-purple-400">Outstanding Amount</span>
                              <span className="font-medium">₹{cards[activeCardIndex].outstandingAmount.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                              <span className="text-purple-400">Payment Status</span>
                              <span className={`font-medium ${cards[activeCardIndex].isPaid ? 'text-green-500' : 'text-red-500'}`}>
                                {cards[activeCardIndex].isPaid ? 'Paid' : 'Unpaid'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-[#252536] rounded-xl p-4">
                          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                          
                          {cards[activeCardIndex]?.paymentHistory?.length ? (
                            <div className="space-y-3">
                              {cards[activeCardIndex].paymentHistory.map((payment, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                                  <div>
                                    <p className="font-medium">{payment.billingMonth}</p>
                                    <p className="text-xs text-gray-400">{format(new Date(payment.date), 'dd MMM yyyy')}</p>
                                  </div>
                                  <span className="text-green-500 font-medium">₹{payment.amount.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-center py-4">No payment history available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <AddCardModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddCard={handleAddCard} />
          {selectedCard && (
            <EditCardModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedCard(null)
              }}
              onEdit={handleUpdateCard}
              card={selectedCard}
            />
          )}
          {cardToDelete && (
            <DeleteCardModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onDelete={handleDeleteCard}
              card={cardToDelete}
            />
          )}
          <div className="fixed bottom-0 left-0 right-0 bg-[#1c1c28] border-t border-gray-800 py-3 px-6 flex justify-between items-center">
            {/* Home icon */}
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
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <span className="text-xs text-gray-400">Home</span>
            </div>

            {/* Dashboard icon - Update this to make it clickable */}
            <div 
              className="flex flex-col items-center cursor-pointer" 
              onClick={() => router.push('/dashboard')}
            >
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
              <span className="text-xs text-gray-400">Dashboard</span>
            </div>

            {/* Cards icon */}
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
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
              </div>
              <span className="text-xs text-emerald-500 font-medium">Cards</span>
            </div>

            {/* Account icon */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => router.push('/profile')}
            >
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
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M20 21a8 8 0 0 0-16 0"></path>
                </svg>
              </div>
              <span className="text-xs text-gray-400">Account</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
