import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const accessToken = cookieStore.get('gmail_access_token')?.value
    const refreshToken = cookieStore.get('gmail_refresh_token')?.value

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Gmail not connected' },
        { status: 401 }
      )
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Get the full message to find attachments
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    })

    const parts = message.data.payload?.parts || []
    console.log(`Found ${parts.length} parts in message`)

    // Find PDF attachments
    const pdfParts = parts.filter(part => 
      part.mimeType === 'application/pdf' || 
      (part.mimeType === 'application/octet-stream' && part.filename?.toLowerCase().endsWith('.pdf'))
    )

    if (pdfParts.length === 0) {
      return NextResponse.json({
        error: 'No PDF attachments found',
        parts: parts.map(p => ({ mimeType: p.mimeType, filename: p.filename }))
      })
    }

    // Get the first PDF attachment
    const attachment = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: pdfParts[0].body?.attachmentId!
    })

    if (!attachment.data.data) {
      return NextResponse.json(
        { error: 'No attachment data found' },
        { status: 404 }
      )
    }

    // Convert base64 to binary
    const pdfData = Buffer.from(attachment.data.data, 'base64')

    // Return PDF with proper headers
    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfParts[0].filename}"`,
        'Content-Length': pdfData.length.toString()
      }
    })

  } catch (error: any) {
    console.error('Error fetching attachment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch attachment',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
