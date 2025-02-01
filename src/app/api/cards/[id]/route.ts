import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import jwt from "jsonwebtoken";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_TOKEN_SECRET!
    ) as { id: string };
    const userId = decodedToken.id;

    const body = await request.json();
    const cardId = params.id;

    // Find the existing card
    const existingCard = await Card.findOne({ _id: cardId, userId });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 }
      );
    }

    if (body.isPaid) {
      const currentDate = new Date();
      const billingMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Get the current card to access its outstanding amount before updating
      const currentCard = await Card.findById(cardId);
      const amountPaid = currentCard.outstandingAmount; // This is the amount that was paid
      
      const updatedCard = await Card.findByIdAndUpdate(
        cardId,
        {
          $set: {
            isPaid: true,
            outstandingAmount: 0,
            lastPaymentAmount: amountPaid, // Store the amount that was actually paid
            lastPaymentDate: currentDate
          },
          $push: {
            paymentHistory: {
              amount: amountPaid, // Store the amount that was actually paid
              date: currentDate,
              billingMonth: billingMonth,
              outstandingAfterPayment: 0
            }
          }
        },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updatedCard });
    }

    // Update other card details
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { 
        $set: {
          cardName: body.cardName,
          bankName: body.bankName,
          cardLimit: body.cardLimit,
          billingDate: body.billingDate,
          outstandingAmount: body.outstandingAmount,
          cardNumber: body.cardNumber,
          cvv: body.cvv,
          imageUrl: body.imageUrl
        }
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Card updated successfully",
      success: true,
      data: updatedCard,
    });
  } catch (error: any) {
    console.error("Error updating card:", error.message);
    return NextResponse.json(
      { error: "Error updating card", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_TOKEN_SECRET!
    ) as { id: string };
    const userId = decodedToken.id;

    const cardId = params.id;
    const deletedCard = await Card.findOneAndDelete({ _id: cardId, userId });

    if (!deletedCard) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Card deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Error deleting card" },
      { status: 500 }
    );
  }
} 