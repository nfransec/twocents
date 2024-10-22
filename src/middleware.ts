import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail'

    const token = request.cookies.get('token')?.value || ''

    if (isPublicPath && token) {
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
        '/profile',
        '/login',
        '/signup',
        '/verifyemail',
        '/admin/:path*'
    ]
}
