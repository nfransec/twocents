import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const updateSchema = z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
});

export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = request.cookies.get("token")?.value;
        if(!token) {
            return NextResponse.json({ error: "No token found" }, { status: 401 });
        }

        const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as { id: string };
        const userId = decodedToken.id;

        const reqBody = await request.json();
        const validatedData = updateSchema.parse(reqBody);

        const updatedUser = await User.findByIdAndUpdate(userId, validatedData, { new: true }).select("-password");
        if(!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: 'User updaed successfully',
            data: updatedUser,
            success: true,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: "An error occurred while updating user data" }, { status: 500 });
      }
}