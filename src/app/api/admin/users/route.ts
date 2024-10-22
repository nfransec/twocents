import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const users = await User.find({}).select("-password");
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 });
    }
}

