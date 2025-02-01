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

    // Get the current card to access its outstanding amount before updating
    const currentCard = await Card.findById(cardId);
    
    if (!currentCard) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    const amountPaid = currentCard.outstandingAmount; // Now safe to access

    // If marking as paid, prepare payment history
    if (body.isPaid) {
      // Create a new payment history array by combining existing and new
      const newPaymentHistory = [
        ...(currentCard.paymentHistory || []),
        {
          amount: amountPaid,
          date: new Date(),
          billingMonth: new Date().toISOString().slice(0, 7),
          outstandingAfterPayment: 0
        }
      ];

      // Update all fields including payment history
      const updatedCard = await Card.findByIdAndUpdate(
        cardId,
        {
          ...body,
          paymentHistory: newPaymentHistory
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        data: updatedCard,
      });
    }

    // Regular update without payment history
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      body,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedCard,
    });
  } catch (error: any) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: error.message || "Error updating card" },
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