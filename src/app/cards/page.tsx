'use client'

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddCardModal } from "@/components/AddCardModal"
import { Bell, CreditCard, FileText, HelpCircle, Home, LogOut, Trash2, Pencil, User } from "lucide-react"
import CustomSidebar from "@/components/customSidebar"
import CustomFormField from "@/components/CustomFormField"
import { FormFieldType } from "@/components/forms/UserForm"
import Image from "next/image"


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
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)

  useEffect(() => {
    fetchCards()
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

  return (
    <div className="container mx-auto px-4 py-8 text-white">
        {/* Sidebar */}
        <CustomSidebar />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Cards</h1>
        <Button onClick={() => setIsAddCardModalOpen(true)}>Add New Card</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card._id}>
            <CardHeader>
              <CardTitle>{card.cardName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Bank: {card.bankName}</p>
              <p>Limit: ${card.cardLimit}</p>
              <p>Billing Date: {card.billingDate}</p>
              <p>Outstanding: ${card.outstandingAmount}</p>
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

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={handleAddCard}
      />
    </div>
  )
}

