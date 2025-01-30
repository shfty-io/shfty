import { ProductFAQ } from "./ProductFAQ"
import { RefundPolicy } from "./RefundPolicy"
import { ReportDialog } from "./ReportDialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { ProductDescription } from "./ProductDescription"
import { ProductLanguages } from "./ProductLanguages"

interface ProductDetailsProps {
  productId: string
  productName: string
  categories: string[]
  technologies: string[] | null
  description: string | null
  faq: Array<{
    question: string
    answer: string
  }> | null
  sellerEmail: string | null
  sellerFullName: string | null
}

export function ProductDetails({ 
  productId, 
  productName, 
  categories, 
  technologies,
  description,
  faq, 
  sellerEmail, 
  sellerFullName 
}: ProductDetailsProps) {
  return (
    <div className="mx-auto max-w-[1440px] flex flex-col gap-[60px] pb-[60px] md:flex-row md:gap-20 md:pb-0">
      {/* Main content area */}
      <div className="w-full">
        <div className="flex flex-col space-y-[60px] md:flex-col md:space-y-[60px] lg:max-w-[900px] lg:space-y-20">
          <ProductDescription description={description} />
          <ProductFAQ faq={faq} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full space-y-[60px] md:max-w-[300px] md:space-y-10">
        <ProductLanguages technologies={technologies} />
        
        {categories && categories.length > 0 && (
          <div className="space-y-5">
            <h6 className="body-s md:body-xs font-semibold">Categories</h6>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <Link 
                  key={category}
                  href={`/category/${category.toLowerCase()}`}
                  className="no-underline"
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    {category}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          <h6 className="body-s md:body-xs font-semibold">Support</h6>
          <div className="space-y-4">
            {sellerEmail && (
              <Button variant="ghost" asChild className="w-full justify-start p-0">
                <a href={`mailto:${sellerEmail}?subject=Question about ${encodeURIComponent(productName)}`} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact {sellerFullName || 'Seller'}
                </a>
              </Button>
            )}
            <div className="flex items-center space-x-2.5">
              <ReportDialog productId={productId} productName={productName} />
            </div>
          </div>
        </div>

        <RefundPolicy />
      </div>
    </div>
  )
} 