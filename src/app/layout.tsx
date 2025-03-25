import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MobileWarning } from "@/components/MobileWarning";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Software Marketplace",
  description: "Buy and sell software products",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192x192.png',
    shortcut: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.ico" />
        <link rel="shortcut icon" href="/logo.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        <GoogleAnalytics />
        <MobileWarning />
        
        {/* Background grid with glow effect - now scrolls with page */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-[500px]" style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 60%)'
          }}></div>
          <div className="absolute top-[5%] left-1/4 h-[300px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]"></div>
          <div className="absolute top-[15%] right-1/3 h-[250px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        </div>
        
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
