import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Verify admin status
    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_TOKEN_SECRET!
    ) as { id: string };
    
    const adminUser = await User.findById(decodedToken.id);
    
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const cardId = params.id;

    // Delete card
    const deletedCard = await Card.findByIdAndDelete(cardId);

    if (!deletedCard) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Verify admin status
    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_TOKEN_SECRET!
    ) as { id: string };
    
    const adminUser = await User.findById(decodedToken.id);
    
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const cardId = params.id;
    const body = await request.json();

    // Update card
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { ...body },
      { new: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
    });
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

