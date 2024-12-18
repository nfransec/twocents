import { NextResponse } from "next/server";
import { TwitterApi } from 'twitter-api-v2';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { connectToDatabase } from "@/database/database";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { tweet } = await request.json();
        
        if(!tweet || typeof tweet !== 'string') {
            return NextResponse.json({ error: 'Invalid tweet content' }, { status: 400 });
        }

        // Create client with OAuth 2.0 bearer token
        const userClient = new TwitterApi(session.accessToken as string, {
            prefix: 'https://api.twitter.com/2/',
        });

        try {
            const response = await userClient.v2.tweet({
                text: tweet,
            });
            console.log('Tweet posted successfully:', response.data);

            // Store in MongoDB
            await connectToDatabase();
            const PostedTweet = mongoose.models.PostedTweet || mongoose.model('PostedTweet', new mongoose.Schema({
                content: String,
                twitterId: String,
                postedAt: Date,
                userId: String,
            }));

            await PostedTweet.create({
                content: tweet,
                twitterId: response.data.id,
                postedAt: new Date(),
                userId: session.user?.id,
            });

            return NextResponse.json({ success: true, tweetId: response.data.id });
        } catch (twitterError: any) {
            console.error('Twitter API Error:', {
                code: twitterError?.code,
                message: twitterError?.message,
                data: twitterError?.data,
            });
            
            if (twitterError?.code === 403) {
                return NextResponse.json({ 
                    error: 'Twitter API permissions error. Please sign out and sign in again.' 
                }, { status: 403 });
            }
            
            throw twitterError;
        }
    } catch (error: any) {
        console.error('Error posting tweet:', error);
        
        const errorMessage = error.data?.detail || error.message || 'Failed to post tweet';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}