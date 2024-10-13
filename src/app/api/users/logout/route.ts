import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json({
            message: 'Logout successful',
            success: true,
        });
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });
        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 });
      }
}