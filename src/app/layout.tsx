import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from 'next/font/google'
import "./globals.css";
import { Toaster } from "sonner";

import { cn } from '@/lib/utils';
import { ThemeProvider } from "@/components/theme-provider";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";
import ConditionalHeader from "@/components/ConditionalHeader";
import { useTokenExpiryCheck } from "@/hooks/useTokenExpiryCheck";

const fontSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: "TwoCents",
  description: "Track and Manage your credit cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1c1c28" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className={cn('min-h-screen bg-dark-300 font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
        >
          <div className="flex flex-col min-h-screen">
            {/* <ConditionalHeader /> */}
            <main className="flex-1 p-4">
              {children}
            </main>
            <ConditionalBottomNav />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
