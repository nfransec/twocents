import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { z } from 'zod';

const cardSchema = z.object({
  cardName: z.string().min(2),
  bankName: z.string().min(2),
  cardLimit: z.number().min(0),
  billingDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  outstandingAmount: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getDataFromToken(request);
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

    const userId = await getDataFromToken(request);
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