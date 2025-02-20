import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

export async function GET() {
    try {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ]

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        })

        return NextResponse.json({ url: authUrl })
    } catch (error) {
        console.error('Gmail auth error:', error)
        return NextResponse.json(
            { error: 'Failed to initialize Gmail authentication' },
            { status: 500 }
        )
    }
}