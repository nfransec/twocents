'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const userFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
})

const cardFormSchema = z.object({
    cardName: z.string().min(2, {
      message: "Card name must be at least 2 characters.",
    }),
    bankName: z.string().min(2, {
      message: "Bank name must be at least 2 characters.",
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

type Card = z.infer<typeof cardFormSchema>;

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [isAddingCard, setIsAddingCard] = useState(false)

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      username: "",
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
    },
  })

  useEffect(() => {
    getUserDetails()
    getCards()
  }, [])

  const getUserDetails = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      userForm.reset({
        fullName: res.data.data.fullName,
        username: res.data.data.username,
        email: res.data.data.email,
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getCards = async () => {
    try {
      const res = await axios.get('/api/cards')
      setCards(res.data.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    }
  }

  const onSubmitUserForm = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true)
    try {
      const res = await axios.put('/api/users/update', values)
      console.log(res);
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitCardForm = async (values: z.infer<typeof cardFormSchema>) => {
    setIsLoading(true)
    try {
      await axios.post('/api/cards', values)
      toast.success("Card added successfully")
      setIsAddingCard(false)
      getCards()
      cardForm.reset()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          // Handle validation errors
          const validationErrors = error.response.data.error
          validationErrors.forEach((err: { path: string[], message: string }) => {
            cardForm.setError(err.path[0] as "cardName" | "bankName" | "cardLimit" | "billingDate" | "outstandingAmount", {
              type: "manual",
              message: err.message
            })
          })
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('An unknown error occurred')
      }
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
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
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
                {cards.map((card, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{card.cardName}</CardTitle>
                      <CardDescription>{card.bankName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Card Limit: ${card.cardLimit}</p>
                      <p>Billing Date: {new Date(card.billingDate).toLocaleDateString()}</p>
                      <p>Outstanding Amount: ${card.outstandingAmount}</p>
                    </CardContent>
                  </Card>
                ))}
                <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
                  <DialogTrigger asChild>
                    <Button>Add New Card</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Card</DialogTitle>
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
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
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
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
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
                          Add Card
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
          <Button onClick={logout} disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}