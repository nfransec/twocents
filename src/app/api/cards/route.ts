import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import jwt from "jsonwebtoken";
import { z } from 'zod';

const cardSchema = z.object({
  cardName: z.enum(['platinumtravel', 'mrcc', 'goldcharge', 'simplyclick', 'prime', 'elite', 'bpcloctane', 'cashback', 'clubvistaraprime', 'yatra', 'simplysave', 'irctcplatinum', 'altura', 'alturaplus', 'ixigo', 'lit', 'vetta', 'zenith', 'zenithplus', 'indianoilextra', 'irctc', 'icon', 'paisabazarduet', 'play', 'worldsafari', 'shoprite', 'adanione', 'amazonpay', 'emiratesskywards', 'hpclcoral', 'hpcl', 'sapphiro', 'coral', 'emeralde', 'hpclsupersaver', 'tataneu', '6erewards', '6erewardsxl', 'allmiles', 'easyemi', 'pixelplay', 'platinumedge', 'times', 'millenia', 'regalia', 'regaliafirst', 'infinia', 'dinersclub', 'clubvistara', 'ashva', 'mayura', 'millenia', 'onecard', 'powerplus']),
  bankName: z.enum(['amex', 'sbi', 'au', 'rbl', 'icici', 'hdfc', 'idfc']),
  cardLimit: z.number().min(0),
  billingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  outstandingAmount: z.number().min(0),
  imageUrl: z.string().optional(),
});

interface JwtPayload {
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const reqBody = await request.json();
    const validatedData = cardSchema.parse(reqBody);

    const imageUrl = `/${validatedData.cardName.toLowerCase()}-${validatedData.bankName.toLowerCase()}.png`;
    console.log(imageUrl);
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
      const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    console.error(error);
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
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const updateData = await request.json();
    const { _id, ...cardData } = updateData;

    const validatedData = cardSchema.parse(cardData);

    const normalizedData = {
      ...validatedData,
      cardName: validatedData.cardName.toLowerCase(),
      bankName: validatedData.bankName.toLowerCase(),
    };

    const updatedCard = await Card.findOneAndUpdate(
      { _id, userId },
      normalizedData,
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
      const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "An error occurred while updating the card" }, { status: 500 });
  }
}