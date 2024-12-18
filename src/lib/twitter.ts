import { TwitterApi } from 'twitter-api-v2';

const TWITTER_OAUTH_SCOPES = ['tweet.read', 'tweet.write', 'users.read'];

if (!process.env.TWITTER_CLIENT_ID || 
    !process.env.TWITTER_CLIENT_SECRET) {
    throw new Error('Twitter OAuth 2.0 credentials are not properly configured');
}

export const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

export const auth = twitterClient.generateOAuth2AuthLink(
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    { scope: TWITTER_OAUTH_SCOPES }
);

