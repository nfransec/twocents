import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import Card from "@/models/cardModel";

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const cards = await Card.find({});
        return NextResponse.json(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        return NextResponse.json({ error: "An error occurred while fetching cards" }, { status: 500 });
    }
}
