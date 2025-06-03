import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import jwt from "jsonwebtoken";
import { z } from 'zod';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';
import { calculateRewardValue } from '@/utils/rewardPoints';

const cardSchema = z.object({
  cardName: z.enum(Object.keys(cardToBankMapping) as [CardName, ...CardName[]]),
  bankName: z.enum(['HDFC', 'ICICI', 'SBI', 'Axis', 'Amex', 'RBL', 'IDFC', 'AU Small Finance', 'Standard Chartered']),
  cardLimit: z.number(),
  billingDate: z.string(),
  outstandingAmount: z.number(),
  imageUrl: z.string().optional(),
  cardNumber: z.string().optional(),
  isPaid: z.boolean().optional(),
  paidAmount: z.number().optional(),
  paymentDate: z.string().optional(),
  rewardPoints: z.number().optional(),
  rewardValue: z.number().optional(),
});

const cardUpdateSchema = cardSchema.partial().extend({
  _id: z.string(),
});

interface JwtPayload {
  id: string;
}

interface CardUpdateData {
  cardName?: string;
  bankName?: string;
  cardLimit?: number;
  billingDate?: string;
  outstandingAmount?: number;
  imageUrl?: string;
  cardNumber?: string;
  isPaid?: boolean;
  paidAmount?: number;
  paymentDate?: string;
  rewardPoints?: number;
  rewardValue?: number;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const reqBody = await request.json();
    const { cardName, bankName, cardLimit, outstandingAmount, billingDate, rewardPoints } = reqBody;

    const rewardValue = calculateRewardValue(cardName, rewardPoints || 0);

    const newCard = new Card({
      cardName,
      bankName,
      cardLimit,
      outstandingAmount,
      billingDate,
      rewardPoints: rewardPoints || 0,
      rewardValue,
      userId: reqBody.userId
    });

    const savedCard = await newCard.save();
    return NextResponse.json(savedCard);
  } catch (error) {
    return NextResponse.json({ error: "Error creating card" }, { status: 500 });
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
    const reqBody = await request.json();
    const { cardId, cardName, bankName, cardLimit, outstandingAmount, billingDate, rewardPoints } = reqBody;

    const rewardValue = calculateRewardValue(cardName, rewardPoints || 0);

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      {
        cardName,
        bankName,
        cardLimit,
        outstandingAmount,
        billingDate,
        rewardPoints: rewardPoints || 0,
        rewardValue
      },
      { new: true }
    );

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json({ error: "Error updating card" }, { status: 500 });
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
