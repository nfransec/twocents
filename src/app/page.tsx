'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGesture } from 'react-use-gesture'
import Image from 'next/image'
import { useRouter } from 'next/navigation'


export default function LandingPage() {
  const router = useRouter()
  const [swipeProgress, setSwipeProgress] = useState(0)

  const bind = useGesture({
    onDrag: ({ movement: [mx], down, direction: [dx], velocity }) => {
      if (down) {
        setSwipeProgress(Math.min(Math.max(mx / 200, 0), 1))
      } else {
        if (swipeProgress > 0.5 || (velocity > 0.5 && dx > 0)) {
          setSwipeProgress(1)
          console.log('Swipe action completed')
        } else {
          setSwipeProgress(0)
        }
      }
    },
  })

  useEffect(() => {
    if (swipeProgress === 1) {
      router.push('/login')
    }
  }, [swipeProgress])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-16">
      <div className="flex-1 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 flex flex-wrap justify-center items-center">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 m-1 rounded-full border border-gray-700"
            >
              <Image src="/assets/icons/user2.svg" alt="Profile" width={60} height={60} />
            </div>
          ))}
        </div>
      </div>
      <div className='mt-4 mb-4'>
        <motion.div
            className="bg-green-600 rounded-full p-4 flex items-center justify-between cursor-pointer"
            {...bind()}
            style={{
              x: swipeProgress * 200,
            }}
          >
            <span className="font-semibold text-sm">Swipe to get started</span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: swipeProgress > i / 3 ? 1 : 0.5 }}
                />
              ))}
            </div>
        </motion.div>
      </div>

      <div className="p-2 sm:p-4 space-y-2 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-center">
          Get access to your finances <span className="text-green-500">Anytime, Anywhere.</span>
        </h1>
        <p className="text-gray-400 text-center text-sm">
          Secure your financial future with our trusted banking services
        </p>
      </div>

    </div>
  )
}
