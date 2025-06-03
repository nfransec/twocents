import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import Card from "@/models/cardModel";
import jwt from "jsonwebtoken";

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
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

    const { userId } = params;

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all cards associated with the user
    await Card.deleteMany({ userId });

    return NextResponse.json({
      success: true,
      message: "User and associated cards deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;
    const body = await request.json();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...body },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

