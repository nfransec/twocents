'use client'

import React, { useState, useEffect } from 'react'
import { Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 18,
    minutes: 36,
    seconds: 48
  })

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="flex-grow p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              TC
            </div>
            <h1 className="ml-3 sm:ml-4 text-xl sm:text-2xl font-semibold text-gray-700">TwoCent</h1>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2 sm:mb-4">Coming Soon...</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">Stay Connected, Stay Updated!</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 sm:mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center bg-white/10 rounded-lg p-2">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{value}</div>
                <div className="text-xs sm:text-sm uppercase text-blue-100">{unit}</div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">Get Updates!</h3>
            <form className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="flex-grow bg-white/20 border-none text-white placeholder-white/70"
                aria-label="Email Address"
              />
              <Button variant="secondary" className="w-full sm:w-auto bg-purple-500">Send Now</Button>
            </form>
          </div>
        </div>

        <div className="relative w-full h-32 sm:h-48 md:h-64 mb-8">
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-yellow-200 rounded-full"></div>
          <div className="absolute top-0 right-0 w-1/4 h-3/4 bg-purple-400"></div>
          <div className="absolute bottom-0 right-0 w-1/5 h-1/3 bg-blue-300 rounded-full"></div>
        </div>

        <nav className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-4">
          <a href="#" className="hover:text-gray-700">About</a>
          <a href="#" className="hover:text-gray-700">Contact</a>
          <a href="#" className="hover:text-gray-700">Feedback</a>
          <a href="#" className="hover:text-gray-700">Help</a>
        </nav>

        <div className="flex justify-center gap-6">
          <a href="#" aria-label="Share">
            <Share2 className="text-gray-500 hover:text-gray-700" />
          </a>
          <a href="#" aria-label="Facebook">
            <Facebook className="text-gray-500 hover:text-gray-700" />
          </a>
          <a href="#" aria-label="Twitter">
            <Twitter className="text-gray-500 hover:text-gray-700" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <Linkedin className="text-gray-500 hover:text-gray-700" />
          </a>
        </div>
      </div>
    </div>
  )
}