'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"

export default function CardPage() {
    const [cards, setCards] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingCard, setEditingCard] = useState(null)
    const router = useRouter()

    useEffect(() => {
        fetchCards()
    }, [])

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
    
      const handleEditCard = async (e) => {
        e.preventDefault()
        try {
          await axios.put(`/api/cards`, editingCard)
          toast.success("Card updated successfully")
          setEditingCard(null)
          fetchCards()
        } catch (error) {
          toast.error("Failed to update card")
        }
      }
    
      const handleDeleteCard = async (cardId) => {
        try {
          await axios.delete(`/api/cards?id=${cardId}`)
          toast.success("Card deleted successfully")
          fetchCards()
        } catch (error) {
          toast.error("Failed to delete card")
        }
      }
    
      if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Your Cards</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card._id} className="relative">
                <CardHeader>
                  <CardTitle>{card.cardName}</CardTitle>
                  <CardDescription>{card.bankName}</CardDescription>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingCard(card)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Card</DialogTitle>
                          <DialogDescription>Make changes to your card here. Click save when you're done.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditCard}>
                          {/* ... (form fields for editing card) */}
                          <Button type="submit">Save changes</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                    <Image 
                        src={card.imageUrl}
                        width={150}
                        height={150}
                        alt={card.cardName}
                        className="mb-5"
                    />
                    <p>Card Limit: <span className='text-green-700 font-bold'>₹{card.cardLimit}</span></p>
                    <p>Outstanding: <span className={card.oustandingAmount > 10000 ? 'font-bold text-red-700' : 'font-bold text-yellow-600'}>₹{card.outstandingAmount}</span></p>
                    <p>Billing Date: {new Date(card.billingDate).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
}