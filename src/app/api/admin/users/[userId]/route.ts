import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import Card from "@/models/cardModel";

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();
    const { userId } = params;

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Delete all cards associated with the user
    await Card.deleteMany({ userId });

    return NextResponse.json({ message: "User and associated cards deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: "An error occurred while deleting the user" }, { status: 500 });
  }
}

