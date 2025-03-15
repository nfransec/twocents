import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/database";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: string;
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_TOKEN_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    const reqBody = await request.json();
    const { fullName, email, phoneNumber } = reqBody;

    console.log("Update request body:", reqBody);

    // Use findByIdAndUpdate to ensure the field is created if it doesn't exist
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(fullName && { fullName }),
          ...(email && { email }),
          // Always set phoneNumber even if it's empty string
          phoneNumber: phoneNumber || ""
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Updated user:", {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber
    });

    return NextResponse.json({
      message: "User updated successfully",
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        username: updatedUser.username,
        phoneNumber: updatedUser.phoneNumber || "",
        isVerified: updatedUser.isVerified,
        isAdmin: updatedUser.isAdmin
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred while updating the user" }, { status: 500 });
  }
}