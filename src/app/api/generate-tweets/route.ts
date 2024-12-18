import { NextResponse } from "next/server";
import OpenAI from "openai";
import { connectToDatabase } from "@/database/database";
import mongoose from "mongoose";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key is not configured' }, 
                { status: 500 }
            );
        }

        await connectToDatabase();
        const Tweet = mongoose.models.Tweet || mongoose.model('Tweet', new mongoose.Schema({
            query: String,
            suggestions: [String],
            createdAt: Date
        }));

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a witty, engaging social media expert who helps create authentic, conversational tweets. 
                             Write in a natural, personal tone as if the user is casually sharing their thoughts.
                             Avoid hashtags unless specifically requested.
                             Never number the tweets or use quotation marks.
                             Focus on creating relatable, engaging content that feels genuine and spontaneous.`
                },
                {
                    role: 'user',
                    content: `Generate 5 casual, personal-feeling tweets about: ${query}. 
                             Make them sound like real thoughts from a person, not AI-generated content.
                             Keep them conversational and engaging.`
                }
            ],
            max_tokens: 150,
            temperature: 0.9,
        });

        const suggestions = response.choices[0]?.message?.content
            ?.split("\n")
            .filter((line: string) => line.trim())
            .map((line: string) => line.replace(/^[-\d.*•\s]+/, '').trim()) || [];

        await Tweet.create({
            query,
            suggestions,
            createdAt: new Date()
        });

        return NextResponse.json({ tweets: suggestions });
    } catch (error: any) {
        console.error('Error generating tweets:', error);
        
        // Handle specific OpenAI errors
        if (error.error?.type === 'insufficient_quota') {
            return NextResponse.json({ 
                error: 'API quota exceeded. Please check your OpenAI API key and billing status.' 
            }, { status: 429 });
        }

        return NextResponse.json({ 
            error: 'Failed to generate tweets. Please try again later.' 
        }, { status: 500 });
    }
}