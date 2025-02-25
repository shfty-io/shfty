import { Footer } from "@/components/global/Footer";

export default function ProductLayout({
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