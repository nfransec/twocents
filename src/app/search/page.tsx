'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'

import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/CustomFormField'
import { FormFieldType } from '@/components/forms/UserForm'
import CardDesign from '@/components/CardDesign'

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
})

type SearchResult = {
  _id: string
  cardName: string
  bankName: string
  cardNumber?: string
  cardLimit: number
  outstandingAmount: number
  billingDate: string
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({})

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/cards/search?query=${values.query}`)
      setSearchResults(response.data.data)
      if (response.data.data.length === 0) {
        toast.info('No cards found matching your search')
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'An error occurred while searching')
      } else {
        toast.error('An unexpected error occurred')
      }
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const handleEditCard = (card: SearchResult) => {
    // Implement edit functionality
    console.log('Edit card:', card)
  }

  const handleDeleteCard = (cardId: string) => {
    // Implement delete functionality
    console.log('Delete card:', cardId)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Search Your Cards</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="query"
            label="Search"
            placeholder="Enter card name or bank"
            iconSrc="/assets/icons/search.svg"
            iconAlt="search"
          />
          
          <Button type="submit" disabled={isLoading} className="w-full bg-green-500">
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Form>

      {searchResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Search Results ({searchResults.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((card) => (
              <CardDesign 
                key={card._id}
                card={card}
                isFlipped={flippedCards[card._id] || false}
                onClick={() => handleCardFlip(card._id)}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
