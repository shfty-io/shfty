import { Footer } from "@/components/global/Footer";
import { Navbar } from "@/components/global/Navbar";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
} 