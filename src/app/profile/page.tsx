'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CardType {
    _id: string;
    cardName: string;
    bankName: string;
    cardLimit: number;
    billingDate: string;
    outstandingAmount: number;
    imageUrl: string;
  }


const userFormSchema = z.object({
    fullName: z.string().min(2, {
      message: "Full name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email.",
    }),
})

const cardFormSchema = z.object({
    cardName: z.string().min(2, {
      message: "Please select a card name.",
    }),
    bankName: z.string().min(2, {
      message: "Please select a bank name.",
    }),
    cardLimit: z.coerce.number().min(0, {
      message: "Card limit must be a positive number.",
    }),
    billingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Please enter a valid date in YYYY-MM-DD format.",
    }),
    outstandingAmount: z.coerce.number().min(0, {
      message: "Outstanding amount must be a positive number.",
    }),
})

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [cards, setCards] = useState<CardType[]>([])
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)

  const cardNames = ["PlatinumTravel", 'SimplyCLICK', 'Ixigo', 'Play', 'AmazonPay', 'GoldCharge', 'Infinia', 'MRCC', 'TataNeu', 'PowerPlus',]
  const bankNames = ['Amex', 'SBI', 'AU', 'RBL', 'ICICI', 'HDFC', 'IDFC', 'Federal']

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  })

  const cardForm = useForm<z.infer<typeof cardFormSchema>>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardName: "",
      bankName: "",
      cardLimit: 0,
      billingDate: "",
      outstandingAmount: 0,
      //imageUrl: "",
    },
  })

  const getUserDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      userForm.reset({
        fullName: res.data.data.fullName,
        email: res.data.data.email,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [userForm])

  const getCards = useCallback(async () => {
    try {
      const res = await axios.get('/api/cards')
      setCards(res.data.data)
    } catch (error) {
      handleError(error)
    }
  }, [])

  const getImageUrl = (cardName: string, bankName: string) => {
    return `/${cardName.toLowerCase()}-${bankName.toLowerCase()}.png`
  }

  useEffect(() => {
    getUserDetails()
    getCards()
  }, [getUserDetails, getCards])

  const onSubmitUserForm = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true)
    try {
    //   const res = 
      await axios.put('/api/users/update', values)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitCardForm = async (values: z.infer<typeof cardFormSchema>) => {
    setIsLoading(true)
    try {
      const formattedValues = {
        ...values,
        cardLimit: Number(values.cardLimit),
        outstandingAmount: Number(values.outstandingAmount),
        imageUrl: getImageUrl(values.cardName, values.bankName),
      };
      if (editingCard) {
        await axios.put('/api/cards', { id: editingCard._id, ...formattedValues })
        toast.success("Card updated successfully")
        setEditingCard(null)
      } else {
        await axios.post('/api/cards', formattedValues)
        toast.success("Card added successfully")
        setIsAddingCard(false)
      }
      getCards()
      cardForm.reset()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="container flex items-center justify-center min-h-screen text-white">
      <Card className="w-[800px]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onSubmitUserForm)} className="space-y-8">
                  <FormField
                    control={userForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isEditing && (
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  )}
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="cards">
              <div className="space-y-4">
                {cards.map((card) => (
                  <Card key={card._id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{card.cardName}</CardTitle>
                        <CardDescription>{card.bankName}</CardDescription>
                      </div>
                      <Button variant="ghost" onClick={() => {
                        setEditingCard(card)
                        cardForm.reset(card)
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Image 
                            src={getImageUrl(card.cardName, card.bankName)}
                            alt={`${card.cardName} ${card.bankName}`}
                            width={100} 
                            height={60} 
                            className="rounded-md" 
                        />
                        </div>
                        <div className="flex-grow">
                          <p>Card Limit: ${card.cardLimit}</p>
                          <p>Billing Date: {new Date(card.billingDate).toLocaleDateString()}</p>
                          <p>Outstanding Amount: ${card.outstandingAmount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Dialog open={isAddingCard || editingCard !== null} onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingCard(false)
                    setEditingCard(null)
                    cardForm.reset()
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsAddingCard(true)}>Add New Card</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
                      <DialogDescription>Enter your card details below.</DialogDescription>
                    </DialogHeader>
                    <Form {...cardForm}>
                      <form onSubmit={cardForm.handleSubmit(onSubmitCardForm)} className="space-y-4">
                        <FormField
                          control={cardForm.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Name</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a card name" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cardNames.map((name) => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cardForm.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a bank name" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bankNames.map((name) => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cardForm.control}
                          name="cardLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Limit</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cardForm.control}
                          name="billingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cardForm.control}
                          name="outstandingAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Outstanding Amount</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                          {editingCard ? 'Update Card' : 'Add Card'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isLoading}>
              Edit Profile
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button onClick={logout} disabled={isLoading} className="bg-green-500">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}