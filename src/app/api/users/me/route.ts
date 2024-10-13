import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const token = request.cookies.get("token")?.value;
        if(!token) {
            return NextResponse.json({ error: 'No token found' }, { status: 401 });
        }

        const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as { id: string };
        const userId = decodedToken.id;

        const user = await User.findById(userId).select("-password");
        if(!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'User found',
            data: user,
            success: true,
        });
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred while fetching user data"}, { status: 500});
    }
}