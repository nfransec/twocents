import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Increase the max listeners for the MongoDB connection
mongoose.connection.setMaxListeners(15);  // or a higher number if needed

interface JwtPayload {
    id: string;
}

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = request.cookies.get("token")?.value || "";
        
        if (!token) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const decodedToken = jwt.verify(
            token,
            process.env.NEXT_PUBLIC_TOKEN_SECRET!
        ) as { id: string };
        
        const user = await User.findById(decodedToken.id).select("-password");
        
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        console.log("User data being sent:", {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber
        });

        return NextResponse.json({
            message: 'User found successfully',
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber || "",
                isVerified: user.isVerified,
                isAdmin: user.isAdmin
            },
            success: true,
        });
        
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}
