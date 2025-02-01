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
    console.log("Received body:", body); // Debug log

    const cardId = params.id;

    // Create the payment schedule object directly from the request body
    const paymentSchedule = {
      isAutoPayEnabled: body.paymentSchedule.isAutoPayEnabled,
      reminderDays: Number(body.paymentSchedule.reminderDays),
      reminderMethod: 'BOTH'
    };

    console.log("Updating card with payment schedule:", paymentSchedule); // Debug log

    const updatedCard = await Card.findOneAndUpdate(
      { _id: cardId, userId },
      { paymentSchedule }, // Directly set the payment schedule
      { new: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Payment schedule updated successfully",
      success: true,
      data: updatedCard,
    });
  } catch (error: any) {
    console.error("Error updating payment schedule:", error.message);
    return NextResponse.json(
      { error: "Error updating payment schedule", details: error.message },
      { status: 500 }
    );
  }
} 