import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/navigation'

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if(!token) {
        redirect('/login')
    }

    return (
        <>
            <Navigation />
            {children}
        </>
    )
}