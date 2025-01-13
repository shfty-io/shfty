import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/root/Footer";
import { SidebarProvider } from "@/contexts/SidebarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Software Marketplace",
  description: "Buy and sell software products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SidebarProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
