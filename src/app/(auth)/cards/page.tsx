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
import { Pencil, Trash2, PlusCircle } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const bankCardMap = {
    'Amex': ['PlatinumTravel', 'MRCC', 'GoldCharge'],
    'SBI': ['SimplyClick', 'Prime', 'Elite', 'BPCLOctane', 'Cashback', 'ClubVistaraPrime', 'Yatra', 'SimplySAVE', 'IRCTCPlatinum'],
    'AU': ['Altura', 'AlturaPlus', 'Ixigo', 'LIT', 'Vetta', 'Zenith', 'ZenithPlus'],
    'RBL': ['IndianOilExtra', 'IRCTC', 'Icon', 'PaisabazarDuet', 'Play', 'WorldSafari', 'Shoprite'],
    'ICICI': ['AdaniOne', 'AmazonPay', 'EmiratesSkywards', 'HPCLCoral', 'HPCL', 'Sapphiro', 'Coral', 'Emeralde', 'HPCLSuperSaver'],
    'HDFC': ['TataNeu','6ERewards', '6ERewardsXL', 'AllMiles', 'EasyEMI', 'PixelPlay', 'PlatinumEdge', 'Times', 'Millenia', 'Regalia', 'RegaliaFirst', 'Infinia', 'DinersClub'],
    'IDFC': ['ClubVistara', 'Ashva', 'Mayura', 'Millenia', 'OneCard', 'PowerPlus'],
}

const allBanks = ['Amex', 'SBI', 'AU', 'RBL', 'ICICI', 'HDFC', 'IDFC']

export default function CardsPage() {
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCard, setEditingCard] = useState(null)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCard, setNewCard] = useState({
    cardName: '',
    bankName: '',
    cardLimit: 0,
    outstandingAmount: 0,
    billingDate: '',
  })
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
      const updatedCard = {
        ...editingCard,
        imageUrl: `/${editingCard.cardName.toLowerCase()}-${editingCard.bankName.toLowerCase()}.png`,
        cardLimit: parseFloat(editingCard.cardLimit),
        outstandingAmount: parseFloat(editingCard.outstandingAmount)
      }
      await axios.put(`/api/cards`, updatedCard)
      toast.success("Card updated successfully")
      setEditingCard(null)
      fetchCards()
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = typeof error.response.data.error === 'object'
                ? JSON.stringify(error.response.data.error)
                : error.response.data.error || 'Failed to update card';
            toast.error(errorMessage)
          } else {
            toast.error("An unknown error occurred")
          }
      console.error(error)
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

    const handleAddCard = async (e) => {
    e.preventDefault()
    try {
      const cardToAdd = {
        ...newCard,
        imageUrl: `/${newCard.cardName.toLowerCase()}-${newCard.bankName.toLowerCase()}.png`
      }
      await axios.post('/api/cards', cardToAdd)
      toast.success("Card added successfully")
      setIsAddingCard(false)
      setNewCard({
        cardName: '',
        bankName: '',
        cardLimit: 0,
        outstandingAmount: 0,
        billingDate: '',
      })
      fetchCards()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = typeof error.response.data.error === 'object'
            ? JSON.stringify(error.response.data.error)
            : error.response.data.error || 'Failed to updAdate card';
        toast.error(errorMessage)
      } else {
        toast.error("An unknown error occurred")
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cards</h1>
        <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>Enter the details of your new card here.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCard}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bankName" className="text-right">
                    Bank Name
                  </Label>
                  <Select
                    onValueChange={(value) => setNewCard({...newCard, bankName: value, cardName: ''})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardName" className="text-right">
                    Card Name
                  </Label>
                  <Select
                    onValueChange={(value) => setNewCard({...newCard, cardName: value})}
                    disabled={!newCard.bankName}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select card" />
                    </SelectTrigger>
                    <SelectContent>
                      {newCard.bankName && bankCardMap[newCard.bankName].map((card) => (
                        <SelectItem key={card} value={card}>{card}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardLimit" className="text-right">
                    Card Limit
                  </Label>
                  <Input
                    id="cardLimit"
                    type="number"
                    value={newCard.cardLimit}
                    onChange={(e) => setNewCard({...newCard, cardLimit: parseFloat(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="outstandingAmount" className="text-right">
                    Outstanding Amount
                  </Label>
                  <Input
                    id="outstandingAmount"
                    type="number"
                    value={newCard.outstandingAmount}
                    onChange={(e) => setNewCard({...newCard, outstandingAmount: parseFloat(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="billingDate" className="text-right">
                    Billing Date
                  </Label>
                  <Input
                    id="billingDate"
                    type="date"
                    value={newCard.billingDate}
                    onChange={(e) => setNewCard({...newCard, billingDate: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Card</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bankName" className="text-right">
                            Bank Name
                          </Label>
                          <Select
                            onValueChange={(value) => setEditingCard({...editingCard, bankName: value, cardName: ''})}
                            defaultValue={editingCard?.bankName}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {allBanks.map((bank) => (
                                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="cardName" className="text-right">
                            Card Name
                          </Label>
                          <Select
                            onValueChange={(value) => setEditingCard({...editingCard, cardName: value})}
                            defaultValue={editingCard?.cardName}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select card" />
                            </SelectTrigger>
                            <SelectContent>
                              {editingCard?.bankName && bankCardMap[editingCard.bankName].map((card) => (
                                <SelectItem key={card} value={card}>{card}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="cardLimit" className="text-right">
                            Card Limit
                          </Label>
                          <Input
                            id="cardLimit"
                            type="number"
                            value={editingCard?.cardLimit}
                            onChange={(e) => setEditingCard({...editingCard, cardLimit: parseFloat(e.target.value)})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="outstandingAmount" className="text-right">
                            Outstanding Amount
                          </Label>
                          <Input
                            id="outstandingAmount"
                            type="number"
                            value={editingCard?.outstandingAmount}
                            onChange={(e) => setEditingCard({...editingCard, outstandingAmount: parseFloat(e.target.value)})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="billingDate" className="text-right">
                            Billing Date
                          </Label>
                          <Input
                            id="billingDate"
                            type="date"
                            value={editingCard?.billingDate.split('T')[0]}
                            onChange={(e) => setEditingCard({...editingCard, billingDate: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">Save changes</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
                <Image src={card.imageUrl} width={150} height={150} alt={card.cardName} className="mb-5" />
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


