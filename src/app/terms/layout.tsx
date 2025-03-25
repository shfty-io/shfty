import { Footer } from "@/components/global/Footer";
import { Suspense } from "react";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="min-h-screen bg-background flex flex-col">
        <Suspense fallback={<div className="container mx-auto py-10 px-4 md:px-6">Loading terms...</div>}>
          {children}
        </Suspense>
        <Footer />
      </div>
  )
} 