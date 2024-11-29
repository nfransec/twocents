'use client'

import { CreditCard, DollarSign, PieChart, TrendingUp } from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/feature-card'


export default function LandingPage() {

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-199 to-white'>
      <Header />
      <main>
        {/* Hero Section */}
        <section className='py-20 px-4 sm:px-6 lg:px-8'>
          <div className='container mx-auto text-center'>
            <h1 className='text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-300 mb-4'>
              Track your investments <span className='text-emerald-500'>Smarter</span>
            </h1>
            <p className='text-xl text-emerald-700 mb-8 max-w-2xl mx-auto'>
              Manage your investments, credit cards, assets, and track your profits and losses all in one place.
            </p>
            <div className='flex  justify-center space-x-4 text-white'>
              <Button size='lg' className='bg-emerald-600 hover:bg-emerald-700'>Get Started</Button>
              <Button size='lg' className='botder border-2 border-emerald-600'>Learn More</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className='text-white py-20 px-4 sm:px-6 lg:px-8 bg-gray-950'>
          <div className='container mx-auto'>
            <h2 className='text-3xl font-bold text-center mb-12'>Powerful Features</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              <FeatureCard
                title="Investment Tracking"
                description='Monitor your stocks, bonds, and other investments in real-time.'
                icon={TrendingUp}
              />
              <FeatureCard
                title='Credit Card Management'
                description='Keep track of your credit card expenses and balances.'
                icon={CreditCard}
              />
              <FeatureCard
                title="Asset Overview"
                description="Get a comprehensive view of all your assets in one place."
                icon={PieChart}
              />
              <FeatureCard
                title="Profit/Loss Analysis"
                description="Analyze your financial performance with detailed reports."
                icon={DollarSign}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 px-4 sm:px-6 lg:px-8 text-white'>
          <div className='container mx-auto text-center'>
            <h2 className='text-3xl font-bold mb-4'>Ready to Take Control of Your Finances</h2>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>Join thousans of users who are already managing their investments smarter with TwoCents</p>
            <Button size='lg' className='bg-emerald-600 hover:bg-emerald-700'>Sign Up Now</Button>
          </div>
        </section>
      </main>

      <footer className='text-white bg-gray-900 py-8 px-4 sm:px-6 lg:px-8'>
        <div className='container mx-auto text-center'>
          <p>&copy; 2024 TwoCent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
