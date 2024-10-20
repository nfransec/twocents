import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function isAuthenticatedServer() {
    const cookieStore = cookies()
    return !!cookieStore.get('auth_token')
}

export async function isAuthenticatedClient() {
    return !!localStorage.getItem('auth_token')
}

export async function logout() {
    cookies().delete('auth_token')
    localStorage.removeItem('auth_token')
    redirect('/login')
}