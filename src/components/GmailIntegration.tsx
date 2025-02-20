import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'

interface StatementDetails {
  cardType: string
  totalAmount: number
  minAmount: number
  dueDate: string
  rawContent?: string // Added for debugging
}

// Map Gmail statement card types to our database card types
const CARD_TYPE_MAPPING: { [key: string]: string } = {
  'Infinia': 'Infinia',
  'Tata Neu': 'Tata Neu',
  'Atlas': 'Atlas'
}

export default function GmailIntegration() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statements, setStatements] = useState<StatementDetails[]>([])

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await axios.get('/api/gmail/status')
      setIsConnected(response.data.isConnected)
      if (response.data.isConnected) {
        await searchAndProcessStatements()
      }
    } catch (error) {
      console.error('Connection check error:', error)
      setIsConnected(false)
    }
  }

  const updateCardWithStatement = async (statement: StatementDetails) => {
    try {
      // First, get all cards to find the matching one
      const cardsResponse = await axios.get('/api/cards')
      const cards = cardsResponse.data.data
      console.log('Available cards:', cards.map((c: any) => c.cardName))
      console.log('Processing statement for:', statement.cardType)

      // Find the matching card using the mapping
      const mappedCardName = CARD_TYPE_MAPPING[statement.cardType]
      console.log('Looking for card name:', mappedCardName)

      // Exact match first, then fallback to includes
      const matchingCard = cards.find((card: any) => 
        card.cardName === mappedCardName || 
        card.cardName.toLowerCase() === mappedCardName.toLowerCase()
      )

      if (!matchingCard) {
        console.error(`No matching card found for ${statement.cardType}`)
        toast.error(`No matching card found for ${statement.cardType}. Available cards: ${cards.map((c: any) => c.cardName).join(', ')}`)
        return false
      }

      console.log('Found matching card:', matchingCard)

      // Update the card with statement details
      const updateResponse = await axios.put(`/api/cards/${matchingCard._id}/statement`, {
        cardId: matchingCard._id,
        totalAmount: statement.totalAmount,
        minAmount: statement.minAmount,
        dueDate: statement.dueDate
      })

      if (updateResponse.data.success) {
        console.log(`Updated ${statement.cardType} card details:`, updateResponse.data)
        toast.success(`Updated ${statement.cardType} card with latest statement`)
        return true
      }
      return false
    } catch (error) {
      console.error(`Failed to update ${statement.cardType} card:`, error)
      return false
    }
  }

  const searchAndProcessStatements = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/gmail/search')
      console.log('Gmail search response:', response.data)

      if (response.data.messages && response.data.messages.length > 0) {
        setStatements(response.data.messages)
      } else {
        toast.info('No statements found')
      }
    } catch (error) {
      console.error('Statement search error:', error)
      toast.error('Failed to process statements')
    } finally {
      setIsLoading(false)
    }
  }

  const connectGmail = async () => {
    try {
      const response = await axios.get('/api/auth/gmail')
      window.location.href = response.data.url
    } catch (error) {
      console.error('Gmail connection error:', error)
      toast.error('Failed to connect to Gmail')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gmail Integration</h2>
        <button
          onClick={connectGmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Connect Gmail
        </button>
      </div>

      {statements.length > 0 && (
        <div className="space-y-4 text-black">
          <p className="text-green-500">Found {statements.length} statements</p>
          {statements.map((statement, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-4">{statement.cardType} Statement</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold">₹{statement.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Due Date</p>
                  <p className="text-xl font-bold">{statement.dueDate || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}