'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGesture } from 'react-use-gesture'
import Image from 'next/image'
import { useRouter } from 'next/navigation'


export default function LandingPage() {

  return (
    <div className='min-h-screen p-1 rounded-3xl'>
      <div style={{ backgroundImage: 'url(/rupee.avif)', backgroundSize: 'cover', height: '100vh', width: '100vw' }}></div>
    </div>
  )
}
