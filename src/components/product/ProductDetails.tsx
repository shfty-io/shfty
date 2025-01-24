import { ProductFAQ } from "./ProductFAQ"
import { RefundPolicy } from "./RefundPolicy"
import { ReportDialog } from "./ReportDialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProductDetailsProps {
  productId: string
  productName: string
  categories: string[]
  faq: Array<{
    question: string
    answer: string
  }> | null
}

export function ProductDetails({ productId, productName, categories, faq }: ProductDetailsProps) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 flex flex-col gap-[60px] pb-[60px] md:flex-row md:gap-20 md:pb-0">
      {/* Main content area */}
      <div className="w-full">
        <div className="flex flex-col space-y-[60px] md:flex-col md:space-y-[60px] lg:max-w-[900px] lg:space-y-20">
          <ProductFAQ faq={faq} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full space-y-[60px] md:max-w-[300px] md:space-y-10">
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