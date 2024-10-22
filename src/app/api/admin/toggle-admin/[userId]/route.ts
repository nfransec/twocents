import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();
    const { userId } = params;
    const { isAdmin } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(userId, { isAdmin }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin status updated successfully", user: updatedUser });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return NextResponse.json({ error: "An error occurred while updating admin status" }, { status: 500 });
  }
}

