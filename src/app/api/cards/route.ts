import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import jwt from "jsonwebtoken";
import { z } from 'zod';

const cardSchema = z.object({
  cardName: z.string().min(2),
  bankName: z.string().min(2),
  cardLimit: z.number().min(0),
  billingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  outstandingAmount: z.number().min(0),
  imageUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!);
    const userId = decodedToken.id;

    const reqBody = await request.json();
    const validatedData = cardSchema.parse(reqBody);

    const newCard = new Card({
      userId,
      ...validatedData,
    });

    await newCard.save();

    return NextResponse.json({
      message: "Card added successfully",
      success: true,
      data: newCard,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "An error occurred while adding the card" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!);
    const userId = decodedToken.id;

    const cards = await Card.find({ userId });

    return NextResponse.json({
      message: "Cards retrieved successfully",
      data: cards,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred while retrieving cards" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!);
    const userId = decodedToken.id;

    const { id, ...updateData } = await request.json();
    const validatedData = cardSchema.parse(updateData);

    const updatedCard = await Card.findOneAndUpdate(
      { _id: id, userId },
      validatedData,
      { new: true }
    );

    if (!updatedCard) {
      return NextResponse.json({ error: "Card not found or you don't have permission to update it" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Card updated successfully",
      success: true,
      data: updatedCard,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "An error occurred while updating the card" }, { status: 500 });
  }
}