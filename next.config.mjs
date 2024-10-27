/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})({
  images: {
    domains: ['github.com'], 
  },
  // Your existing Next.js config here
});

export default nextConfig;
