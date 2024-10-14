import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { z } from 'zod';

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

interface JwtPayload {
    id: string;
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const reqBody = await request.json();
    const validatedData = updateSchema.parse(reqBody);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only update fields that have changed
    if (validatedData.fullName) user.fullName = validatedData.fullName;
    if (validatedData.email) user.email = validatedData.email;

    await user.save();

    return NextResponse.json({
      message: "User updated successfully",
      data: {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      },
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "An error occurred while updating the user" }, { status: 500 });
  }
}