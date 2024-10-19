import type { Metadata } from "next";
import { Plus_Jakarta_Sans} from 'next/font/google'
import "./globals.css";
import { Toaster } from "sonner";

import { cn } from '@/lib/utils';
import { ThemeProvider } from "@/components/theme-provider";

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
      <body className={cn('min-h-screen bg-dark-300 font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
