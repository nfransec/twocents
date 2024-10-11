import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    userId: string;
    email: string;
}

export const getDataFromToken = (request: NextRequest) => {
    try {
        const token = request.cookies.get("token")?.value || '';

        const tokenSecret = process.env.NEXT_PUBLIC_TOKEN_SECRET;
        if(!tokenSecret) {
            throw new Error("Token secret is not defined in the env variables")
        }

        const decodedToken = jwt.verify(token, tokenSecret) as DecodedToken;

        return decodedToken.userId;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Token verification failed: ${error.message}`);
        } else {
            throw new Error('An unknown error occured during token verification.')
        }
    }
};