import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/cards?error=no_code', request.url))
    }

    const { tokens } = await oauth2Client.getToken(code)
    
    // Create response with redirect to cards page instead of profile
    const response = NextResponse.redirect(new URL('/cards?success=true', request.url))

    // Get all existing cookies
    const existingCookies = request.cookies.getAll()
    
    // Preserve all existing cookies except Gmail ones
    existingCookies.forEach(cookie => {
      if (!cookie.name.startsWith('gmail_')) {
        response.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          path: '/'
        })
      }
    })

    // Set new Gmail tokens
    if (tokens.access_token) {
      response.cookies.set('gmail_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600 // 1 hour
      })
    }

    if (tokens.refresh_token) {
      response.cookies.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })
    }

    return response

  } catch (error) {
    console.error('Gmail callback error:', error)
    return NextResponse.redirect(new URL('/cards?error=auth_failed', request.url))
  }
}
