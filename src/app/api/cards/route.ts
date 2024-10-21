import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import jwt from "jsonwebtoken";
import { z } from 'zod';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';

const cardSchema = z.object({
  cardName: z.enum(Object.keys(cardToBankMapping) as [CardName, ...CardName[]]),
  bankName: z.enum(Object.values(cardToBankMapping) as [string, ...string[]]),
  cardLimit: z.number(),
  billingDate: z.string(),
  outstandingAmount: z.number(),
  imageUrl: z.string().optional(),
});

const cardUpdateSchema = cardSchema.partial().extend({
  _id: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as { id: string };
    const userId = decodedToken.id;

    const body = await request.json();
    console.log('Received body:', JSON.stringify(body));

    try {
      const validatedData = cardSchema.parse(body);
      console.log('Validated data:', validatedData);

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
        console.error('Zod validation error:', error);
        const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /api/cards:', error);
    return NextResponse.json({ error: "An error occurred while adding the card" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as JwtPayload;
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
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as { id: string };
    const userId = decodedToken.id;

    const body = await request.json();
    console.log('Received body:', JSON.stringify(body));

    try {
      const validatedData = cardUpdateSchema.parse(body);
      console.log('Validated data:', validatedData);

      const { _id, ...updateData } = validatedData;

      const updatedCard = await Card.findOneAndUpdate(
        { _id, userId },
        updateData,
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
        console.error('Zod validation error:', error);
        const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in PUT /api/cards:', error);
    return NextResponse.json({ error: "An error occurred while updating the card" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const _id = request.nextUrl.searchParams.get('_id');

    if (!_id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const deletedCard = await Card.findOneAndDelete({ _id, userId });

    if (!deletedCard) {
      return NextResponse.json({ error: "Card not found or you don't have permission to delete it" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Card deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/cards:', error);
    return NextResponse.json({ error: "An error occurred while deleting the card" }, { status: 500 });
  }
}
