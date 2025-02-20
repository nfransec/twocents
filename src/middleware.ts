import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Add Gmail callback to public paths
    const isPublicPath = path === '/login' || 
                        path === '/signup' || 
                        path === '/verifyemail' ||
                        path.startsWith('/api/auth/gmail/callback')

    const token = request.cookies.get('token')?.value || ''

    if (isPublicPath && token) {
        // Don't redirect Gmail callback even if user has token
        if (path.startsWith('/api/auth/gmail/callback')) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/', request.nextUrl))
    }

    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Check for admin routes
    if (path.startsWith('/admin')) {
        const isAdmin = request.cookies.get('isAdmin')?.value === 'true'
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', request.nextUrl))
        }
    }
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',
        '/profile',
        '/verifyemail',
        '/admin/:path*',
        '/api/auth/gmail/callback'
    ]
}
