import { Footer } from "@/components/global/Footer";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="min-h-screen bg-background flex flex-col">
        {children}
        <Footer />
      </div>
  )
} 