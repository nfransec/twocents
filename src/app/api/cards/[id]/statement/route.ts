import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/database/database'
import Card from '@/models/cardModel'
import jwt from 'jsonwebtoken'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const token = request.cookies.get('token')?.value || ''
    const decodedToken = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_TOKEN_SECRET!
    ) as { id: string }
    const userId = decodedToken.id

    const body = await request.json()
    const { totalAmount, minAmount, dueDate } = body
    const cardId = params.id

    console.log('Updating card statement:', { cardId, totalAmount, minAmount, dueDate })

    // Find and update the card
    const updatedCard = await Card.findOneAndUpdate(
      { _id: cardId, userId },
      {
        outstandingAmount: totalAmount,
        minPayment: minAmount,
        dueDate: new Date(dueDate),
        lastStatementDate: new Date(),
        isPaid: false, // Reset paid status for new statement
        $push: {
          statementHistory: {
            amount: totalAmount,
            dueDate: new Date(dueDate),
            minPayment: minAmount,
            date: new Date()
          }
        }
      },
      { new: true }
    )

    if (!updatedCard) {
      console.error('Card not found:', cardId)
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('Card updated successfully:', updatedCard)

    return NextResponse.json({
      success: true,
      data: updatedCard
    })
  } catch (error) {
    console.error('Error updating card statement:', error)
    return NextResponse.json(
      { error: 'Failed to update card statement' },
      { status: 500 }
    )
  }
}
