import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();
    const { userId } = params;
    
    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // In a real-world scenario, you'd send this password to the user's email
    console.log(`New password for user ${userId}: ${newPassword}`);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: "An error occurred while resetting the password" }, { status: 500 });
  }
}
