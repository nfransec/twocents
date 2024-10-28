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
    <div className='min-h-screen p-1 rounded-3xl'>
      <div className='h-96 bg-gradient-to-r from-emerald-500 to-emerald-900 rounded-3xl'>
        <div className='flex flex-col justify-center items-center h-full space-y-4 p-4'>
          <h1 className='text-white text-5xl font-bold'>Got too many Credit Cards?</h1>
          <h1 className='text-dark-200 text-5xl font-bold'>Manage them with ease here!</h1>
        </div>
      </div>
    </div>
  )
}
