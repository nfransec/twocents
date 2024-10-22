import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";

export async function DELETE(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    await connectToDatabase();
    const { cardId } = params;
    await Card.findByIdAndDelete(cardId);
    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: "An error occurred while deleting the card" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    await connectToDatabase();
    const { cardId } = params;
    const updatedCardData = await request.json();
    const updatedCard = await Card.findByIdAndUpdate(cardId, updatedCardData, { new: true });
    if (!updatedCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: "An error occurred while updating the card" }, { status: 500 });
  }
}

