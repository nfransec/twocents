import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// MIME types that could represent PDF files
const PDF_MIME_TYPES = ['application/pdf', 'application/octet-stream']

function extractStatementDetails(content: string, cardType: string) {
  try {
    //console.log(`Starting extraction for ${cardType}`);
    
    if (cardType === 'Infinia') {
      // For Infinia card
      //console.log('Processing Infinia card statement...');
      
      // Log the first 500 characters to verify content
      //console.log('Content preview:', content.substring(0, 500));
      
      const totalAmountMatch = content.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*<\/td>\s*<td[^>]*>\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*<\/td>\s*<td[^>]*>\s*\d{2}-\d{2}-\d{4}/);
      //console.log('Total amount match:', totalAmountMatch);
      
      const minAmountMatch = content.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*<\/td>\s*<td[^>]*>\s*\d{2}-\d{2}-\d{4}/);
      //console.log('Min amount match:', minAmountMatch);
      
      const dueDateMatch = content.match(/(\d{2}-\d{2}-\d{4})/);
      //console.log('Due date match:', dueDateMatch);

      const result = {
        totalAmount: totalAmountMatch ? parseFloat(totalAmountMatch[1].replace(/,/g, '')) : 0,
        minAmount: minAmountMatch ? parseFloat(minAmountMatch[1].replace(/,/g, '')) : 0,
        dueDate: dueDateMatch ? dueDateMatch[1] : ''
      };
      
      //console.log('Infinia extracted result:', result);
      return result;
      
    } else if (cardType === 'Tata Neu') {
      // Updated Tata Neu extraction based on actual HTML structure
      //console.log('Processing Tata Neu card statement...');
      
      const totalAmountMatch = content.match(/Total amount due[^>]*>[\s\S]*?bgcolor="#efefef"[^>]*>([0-9,]+\.[0-9]{2})</);
      const minAmountMatch = content.match(/Minimum amount due[^>]*>[\s\S]*?bgcolor="#efefef"[^>]*>([0-9,]+\.[0-9]{2})</);
      const dueDateMatch = content.match(/Payment amount due[^>]*>[\s\S]*?bgcolor="#efefef"[^>]*>(\d{2}-\d{2}-\d{4})</);

      console.log('Tata Neu matches:', {
        total: totalAmountMatch?.[1],
        min: minAmountMatch?.[1],
        date: dueDateMatch?.[1]
      });

      const result = {
        totalAmount: totalAmountMatch ? parseFloat(totalAmountMatch[1].replace(/,/g, '')) : 0,
        minAmount: minAmountMatch ? parseFloat(minAmountMatch[1].replace(/,/g, '')) : 0,
        dueDate: dueDateMatch ? dueDateMatch[1] : ''
      };
      
      //console.log('Tata Neu extracted result:', result);
      return result;
    } else if (cardType === 'Atlas') {
      //console.log('Processing Atlas card statement...');
      
      // Updated regex patterns based on actual HTML structure
      const totalAmountMatch = content.match(/(\d+)\s*Dr<\/td>/);
      const minAmountMatch = content.match(/Minimum Amount Due[^>]*>[\s\S]*?(\d+)\s*Dr<\/td>/);
      const dueDateMatch = content.match(/Payment Due Date[^>]*>[\s\S]*?(\d{2}\/\d{2}\/\d{4})<\/td>/);

      console.log('Atlas matches:', {
        total: totalAmountMatch?.[1],
        min: minAmountMatch?.[1],
        date: dueDateMatch?.[1]
      });

      const result = {
        totalAmount: totalAmountMatch ? parseFloat(totalAmountMatch[1].replace(/,/g, '')) : 0,
        minAmount: minAmountMatch ? parseFloat(minAmountMatch[1].replace(/,/g, '')) : 0,
        dueDate: dueDateMatch ? dueDateMatch[1].replace(/\//g, '-') : ''
      };

      //console.log('Atlas extracted result:', result);
      return result;
    }

    // Default return if no card type matches
    return {
      totalAmount: 0,
      minAmount: 0,
      dueDate: ''
    };
  } catch (error) {
    console.error('Error extracting statement details:', error);
    return {
      totalAmount: 0,
      minAmount: 0,
      dueDate: ''
    };
  }
}

export async function GET() {
  try {
    console.log('Starting Gmail search...')
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
    
    // Get current month and year
    const currentDate = new Date()
    const monthYear = `${currentDate.toLocaleString('en-US', { month: 'long' })}-${currentDate.getFullYear()}`
    const monthYear2 = `${currentDate.toLocaleString('en-US', { month: 'long' })} ${currentDate.getFullYear()}`
    
    //const searchQuery = `from:(emailstatements.cards@hdfcbank.net) subject:((infinia OR "tata neu") AND (${monthYear}))`
    const searchQuery = `from:(emailstatements.cards@hdfcbank.net OR cc.statements@axisbank.com) subject:((infinia OR "tata neu" OR "Axis Bank Atlas") AND (${monthYear} OR ${monthYear2}))`
    console.log('Search query:', searchQuery)

    // First, get message IDs
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 10
    })

    //console.log('Initial search response:', response.data)

    if (!response.data.messages || response.data.messages.length === 0) {
      console.log('No messages found')
      return NextResponse.json({ 
        success: true,
        messages: [],
        totalFound: 0
      })
    }

    // Then get full message details including body
    const fullMessages = await Promise.all(
      response.data.messages.map(async (message) => {
        //console.log('Fetching message:', message.id)
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'  // Request full message format
        })
        return fullMessage.data
      })
    )

    console.log(`Retrieved ${fullMessages.length} full messages`)

    const processedMessages = fullMessages.map(message => {
      const headers = message.payload?.headers || []
      const subject = headers.find(h => h.name === 'Subject')?.value || ''
      const from = headers.find(h => h.name === 'From')?.value || ''
      
      console.log('Processing message:', { subject, from })

      // Get the message body
      let bodyContent = ''
      if (message.payload?.parts) {
        // Handle multipart message
        const textPart = message.payload.parts.find(part => 
          part.mimeType === 'text/plain' || part.mimeType === 'text/html'
        )
        if (textPart?.body?.data) {
          bodyContent = Buffer.from(textPart.body.data, 'base64').toString()
        }
      } else if (message.payload?.body?.data) {
        // Handle single part message
        bodyContent = Buffer.from(message.payload.body.data, 'base64').toString()
      }

      //console.log('Body content length:', bodyContent.length)

      const cardType = subject.toLowerCase().includes('infinia') ? 'Infinia' : subject.toLowerCase().includes('tata neu') ? 'Tata Neu' : subject.toLowerCase().includes('atlas') ? 'Atlas' : ''
      
      console.log(`Extracting details for ${cardType} card...`);
      const details = extractStatementDetails(bodyContent, cardType);
      //console.log('Extracted details:', details);

      return {
        id: message.id,
        subject,
        from,
        cardType,
        ...details,
        rawContent: bodyContent
      }
    })

    console.log(`Processed ${processedMessages.length} messages`)

    return NextResponse.json({
      success: true,
      messages: processedMessages,
      totalFound: processedMessages.length
    })

  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search Gmail', details: error.message },
      { status: 500 }
    )
  }
}
