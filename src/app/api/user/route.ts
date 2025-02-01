import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decodedToken = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_TOKEN_SECRET!
    ) as { id: string };

    // Get user from database
    const user = await User.findById(decodedToken.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error fetching user", details: error.message },
      { status: 500 }
    );
  }
} 