import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
    return (
        <header className='py-4 px-4 sm:px-6 lg:px-8 text-white bg-emerald-700'>
            <div className='container mx-auto flex justify-between items-center'>
                <Link href='/' className='text-2xl font-bold text-white'>TwoCent</Link>
                <nav className='hidden md:flex space-x-4'>
                    <Link href='#features' className='text-md font-medium hover:text-gray-300'>Features</Link>
                    <Link href='#pricing' className='text-md font-medium hover:text-gray-300'>Pricing</Link>
                    <Link href='#about' className='text-md font-medium hover:text-gray-300'>About</Link>
                </nav>
                <div className='flex items-center space-x-4'>
                    <Button variant='ghost' className='text-white bg-emerald-950 hover:bg-emerald-900'>Log In</Button>
                    <Button variant='outline' className='text-white hover:bg-emerald-900'>Sign Up</Button>
                </div>
            </div>
        </header>
    )
}