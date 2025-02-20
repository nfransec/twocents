import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear Gmail tokens
  response.cookies.set('gmail_access_token', '', { maxAge: 0 })
  response.cookies.set('gmail_refresh_token', '', { maxAge: 0 })
  
  return response
}
