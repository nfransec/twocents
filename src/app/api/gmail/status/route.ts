import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('gmail_access_token')?.value
    const refreshToken = cookieStore.get('gmail_refresh_token')?.value

    const isConnected = Boolean(accessToken && refreshToken)

    return NextResponse.json({
      isConnected,
      tokens: {
        hasAccessToken: Boolean(accessToken),
        hasRefreshToken: Boolean(refreshToken)
      }
    })
  } catch (error) {
    console.error('Error checking Gmail status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check Gmail status',
        isConnected: false 
      },
      { status: 500 }
    )
  }
}
