'use client'

import { useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from 'sonner';

export default function LandingPage() {
    const { data: session } = useSession();
    const [query, setQuery] = useState("");
    const [tweets, setTweets] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTweets = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/generate-tweets", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate tweets');
            }
            setTweets(data.tweets || []);
        } catch (error) {
            console.error('Error fetching tweets:', error);
            setError(error.message || 'Failed to generate tweets. Please try again.');
        }
        setLoading(false);
    };

    const postToTwitter = async (tweet: string) => {
        if (!session) {
            signIn('twitter');
            return;
        }

        setPosting(true);
        try {
            const res = await fetch("/api/post-tweets", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tweet }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to post tweet');
            }

            const data = await res.json();
            toast.success('Tweet posted successfully!');
        } catch (error: any) {
            console.error('Error posting tweet:', error);
            toast.error(error.message || 'Failed to post tweet. Please try again.');
        }
        setPosting(false);
    };

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6'>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent'>
                        TwoCent
                    </h1>
                    {session ? (
                        <div className="flex items-center gap-4">
                            <img 
                                src={session.user?.image || ''} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full border-2 border-emerald-400"
                            />
                            <button
                                onClick={() => signOut()}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn('twitter')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            Sign in with X
                        </button>
                    )}
                </div>

                {/* Input Section */}
                <div className='space-y-4 mb-8'>
                    <textarea
                        placeholder="What's on your mind? Let me help you craft the perfect tweet..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className='w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all'
                    />
                    <button
                        onClick={fetchTweets}
                        disabled={loading}
                        className='w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2'
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Crafting tweets...
                            </>
                        ) : 'Generate Ideas'}
                    </button>
                </div>

                {/* Results Section */}
                <div className='space-y-4'>
                    {tweets.map((tweet, index) => (
                        <div key={index} className='bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors'>
                            <p className='text-gray-200 mb-3'>{tweet}</p>
                            <div className="flex justify-between items-center">
                                <div className='text-sm text-emerald-400'>
                                    {query.length} / 280 characters
                                </div>

                                <button
                                    onClick={() => postToTwitter(tweet)}
                                    disabled={posting}
                                    className='bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2'
                                >
                                    {posting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                            Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                    {error && (
                        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
