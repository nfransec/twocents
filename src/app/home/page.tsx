'use client'

import React, { useState, useEffect } from 'react'
import { Share2, Lock, Facebook, Twitter, Linkedin, Calendar, CreditCard, Eye, EyeOff, LockIcon, PencilIcon, MoreHorizontal, ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 18,
    minutes: 36,
    seconds: 48
  })

  const cardDetails = {
    cardName: 'Sample Card',
    cardNumber: '1234 5678 9101 1234',
    cardHolderName: 'John Doe',
    expiryDate: '12/24',
    cvv: '123',
    balance: 100.00
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 }
        } else if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 }
        } else if (prevTime.hours > 0) {
          return { ...prevTime, hours: prevTime.hours - 1, minutes: 59, seconds: 59 }
        } else if (prevTime.days > 0) {
          return { ...prevTime, days: prevTime.days - 1, hours: 23, minutes: 59, seconds: 59 }
        } else {
          clearInterval(timer)
          return prevTime
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">CARD DETAILS</h1>
        <button className="text-gray-600">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main className="flex-1 p-4">
        <div className="mb-6">
          <Card className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded"></div>
              <p className="text-2xl font-bold">VISA</p>
            </div>
            <p className="text-2xl mb-4">{cardDetails.cardNumber}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm opacity-80">Balance</p>
                <p className="text-3xl font-bold">${cardDetails.balance.toFixed(2)}</p>
              </div>
              <p>{cardDetails.cardHolderName}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Button variant="outline" className="flex flex-col items-center py-4">
            <Lock className="mb-2" size={24} />
            <span className="text-xs">Lock Card</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center py-4">
            <PencilIcon className="mb-2" size={24} />
            <span className="text-xs">Edit Details</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center py-4">
            <MoreHorizontal className="mb-2" size={24} />
            <span className="text-xs">More</span>
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">CARD INFORMATION</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs"
            >
              {showInfo ? (
                <>
                  <EyeOff size={16} className="mr-1" /> Hide info
                </>
              ) : (
                <>
                  <Eye size={16} className="mr-1" /> Show info
                </>
              )}
            </Button>
          </div>
          {showInfo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard size={20} className="mr-2 text-gray-500" />
                  <span>Card name</span>
                </div>
                <span className="font-medium">{cardDetails.cardName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard size={20} className="mr-2 text-gray-500" />
                  <span>Card Number</span>
                </div>
                <span className="font-medium">{cardDetails.cardNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2 text-gray-500" />
                  <span>Expiry date</span>
                </div>
                <span className="font-medium">{cardDetails.expiryDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock size={20} className="mr-2 text-gray-500" />
                  <span>CVV (Security Code)</span>
                </div>
                <span className="font-medium">{cardDetails.cvv}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}