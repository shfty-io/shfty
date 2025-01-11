import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication - Software Marketplace",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
} 