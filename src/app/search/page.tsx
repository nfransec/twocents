'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'

import { Form } from '@/components/ui/form'
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
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({})
  const [usdAmount, setUsdAmount] = useState<string>('1')
  const [inrAmount, setInrAmount] = useState<string>('')
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const prevInrAmount = useRef<number>(0)

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  })

  // Fetch exchange rate on component mount
  useEffect(() => {
    fetchExchangeRate()
  }, [])

  const fetchExchangeRate = async () => {
    setIsLoading(true)
    try {
      // Using ExchangeRate-API for real-time rates (free tier)
      const response = await axios.get('https://open.er-api.com/v6/latest/USD')
      
      if (response.data && response.data.rates && response.data.rates.INR) {
        const rate = response.data.rates.INR
        setExchangeRate(rate)
        
        // Update INR amount based on current USD input
        if (usdAmount) {
          const inrValue = parseFloat(usdAmount) * rate
          prevInrAmount.current = parseFloat(inrAmount) || 0
          setInrAmount(inrValue.toFixed(2))
          animateValue()
        }
        
        // Set last updated timestamp
        const now = new Date()
        setLastUpdated(now.toLocaleTimeString())
        
        toast.success('Exchange rate updated successfully')
      } else {
        toast.error('Failed to get exchange rate')
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      toast.error('Failed to fetch exchange rate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsdChange = (value: string) => {
    setUsdAmount(value)
    
    if (value && !isNaN(parseFloat(value)) && exchangeRate) {
      const inrValue = parseFloat(value) * exchangeRate
      prevInrAmount.current = parseFloat(inrAmount) || 0
      setInrAmount(inrValue.toFixed(2))
      animateValue()
    } else {
      setInrAmount('')
    }
  }

  const handleInrChange = (value: string) => {
    setInrAmount(value)
    
    if (value && !isNaN(parseFloat(value)) && exchangeRate) {
      const usdValue = parseFloat(value) / exchangeRate
      setUsdAmount(usdValue.toFixed(2))
    } else {
      setUsdAmount('')
    }
  }

  const animateValue = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1500)
  }

  // Animation variants for the counter
  const counterVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 }
    }
  }

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
    <div className="flex flex-col bg-[#1c1c28] text-white min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Currency Converter</h1>
          <p className="text-sm text-gray-400">USD to INR</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="border-gray-700 text-gray-400"
          onClick={() => router.back()}
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
        </Button>
      </header>

      <main className="flex-1 px-4 pb-20">
        <div className="max-w-md mx-auto py-6">
          <Card className="bg-[#252536] border-gray-700">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Currency Converter</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400"
                  onClick={fetchExchangeRate}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
              {exchangeRate > 0 && (
                <motion.p 
                  className="text-sm text-gray-300 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Current rate: 1 USD = 
                  <motion.span 
                    className="font-bold text-emerald-400 ml-1"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8 }}
                  >
                    {exchangeRate.toFixed(2)}
                  </motion.span> INR
                </motion.p>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">USD Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                  <Input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    className="pl-10 py-6 text-xl font-semibold bg-[#1c1c28] border-gray-700 text-white rounded-xl"
                    placeholder="Enter USD amount"
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <ArrowRight className="h-8 w-8 text-purple-500" />
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">INR Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">₹</span>
                  <Input
                    type="number"
                    value={inrAmount}
                    onChange={(e) => handleInrChange(e.target.value)}
                    className="pl-10 py-6 text-xl font-semibold bg-[#1c1c28] border-gray-700 text-white rounded-xl"
                    placeholder="Enter INR amount"
                  />
                  <AnimatePresence>
                    {isAnimating && (
                      <motion.div 
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="text-emerald-400 text-sm font-bold"
                          animate={counterVariants.animate}
                        >
                          {prevInrAmount.current < parseFloat(inrAmount) ? '↑' : '↓'}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="pt-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button 
                    className="w-full py-6 text-lg font-medium bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-xl"
                    onClick={fetchExchangeRate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Refresh Rate
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
          
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold mb-3">Travel Tips</h2>
            <Card className="bg-[#252536] border-gray-700">
              <CardContent className="p-5 text-sm text-gray-300">
                <ul className="space-y-3">
                  <motion.li 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <span className="text-purple-400 mr-2">•</span>
                    Most US merchants accept credit cards, but keep some cash handy
                  </motion.li>
                  <motion.li 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <span className="text-purple-400 mr-2">•</span>
                    Tipping is customary (15-20% at restaurants)
                  </motion.li>
                  <motion.li 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <span className="text-purple-400 mr-2">•</span>
                    Notify your bank before traveling to avoid card blocks
                  </motion.li>
                  <motion.li 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <span className="text-purple-400 mr-2">•</span>
                    Consider a travel card to avoid foreign transaction fees
                  </motion.li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1c1c28] border-t border-gray-800 py-3 px-6 flex justify-between items-center">
        <div 
          className="flex flex-col items-center cursor-pointer"
          onClick={() => router.push('/')}
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className="text-xs text-gray-400">Home</span>
        </div>

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

        <div 
          className="flex flex-col items-center cursor-pointer"
          onClick={() => router.push('/cards')}
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
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
          <span className="text-xs text-gray-400">Cards</span>
        </div>

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
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <span className="text-xs text-emerald-500 font-medium">Search</span>
        </div>
      </div>
    </div>
  )
}
