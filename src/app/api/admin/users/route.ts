import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // Verify admin status
        const token = request.cookies.get("token")?.value || "";
        const decodedToken = jwt.verify(
            token,
            process.env.NEXT_PUBLIC_TOKEN_SECRET!
        ) as { id: string };
        
        const adminUser = await User.findById(decodedToken.id);
        
        if (!adminUser || !adminUser.isAdmin) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        // Fetch all users
        const users = await User.find({}).select("-password");

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

