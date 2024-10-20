import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Get the user ID from the token
    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as { id: string };
    const userId = decodedToken.id;

    // Search only for cards belonging to the current user
    const cards = await Card.find({
      userId: userId,
      $or: [
        { cardName: { $regex: query, $options: 'i' } },
        { bankName: { $regex: query, $options: 'i' } }
      ]
    });

    return NextResponse.json({
      message: "Search results retrieved successfully",
      data: cards,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred while searching cards" }, { status: 500 });
  }
}
