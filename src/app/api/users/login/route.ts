import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const reqBody = await request.json();
        const validatedData = loginSchema.parse(reqBody);
        const {email, password} = validatedData;

        const user = await User.findOne({ email });
        if(!user) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 400});
        }
        
        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 400})
        }

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

       
        const token = jwt.sign(tokenData, process.env.NEXT_PUBLIC_TOKEN_SECRET!, {expiresIn: "1h"});

        const response = NextResponse.json({
            message: 'Login successful',
            success: true,
        });
        response.cookies.set("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600, // 1 hour
        });

        if (user.isAdmin) {
            response.cookies.set('isAdmin', 'true', {
                httpOnly: true,
                path: '/',
            })
        }

        return response;
        
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error(error);
            return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
        }
        
    }
}
