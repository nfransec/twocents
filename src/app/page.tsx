'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#4A148C] text-white flex flex-col items-center justify-between p-8">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <span className="text-sm">Financial app</span>
        <span className="text-sm">2025 - 2026</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          TwoCents<span className="text-orange-400">.</span>
        </h1>
        
        <p className="text-xl max-w-md text-gray-200">
          App that helps you manage your finances/cards better.
        </p>

        <Button 
          onClick={() => router.push('/cards')}
          className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl"
        >
          Get Started
        </Button>
      </div>

      {/* Footer */}
      <div className="w-full flex justify-center gap-4">
      </div>
    </div>
  )
}