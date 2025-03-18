import { ProductFeatures } from "./ProductFeatures"
import { RefundPolicy } from "./RefundPolicy"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProductDescription } from "./ProductDescription"
import { ProductLanguages } from "./ProductLanguages"
import { ProductLicense } from "./ProductLicense"
import { ProductSupport } from "./ProductSupport"

interface ProductDetailsProps {
  productId: string
  productName: string
  categories: string[]
  technologies: string[] | null
  description: string | null
  features: Array<{
    question: string
    answer: string
  }> | null
  sellerEmail: string | null
  sellerFullName: string | null
  softwareLicense: string | null
}

export function ProductDetails({ 
  productId, 
  productName, 
  categories, 
  technologies,
  description,
  features, 
  sellerEmail, 
  sellerFullName,
  softwareLicense
}: ProductDetailsProps) {
  return (
    <div className="mx-auto max-w-[1440px] flex flex-col gap-[60px] pb-[60px] md:flex-row md:gap-20 md:pb-0">
      {/* Main content area */}
      <div className="w-full">
        <div className="flex flex-col space-y-[60px] md:flex-col md:space-y-[60px] lg:max-w-[900px] lg:space-y-20">
          <ProductDescription description={description} />
          <ProductFeatures features={features} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full space-y-[60px] md:max-w-[300px] md:space-y-10">
        <ProductLicense license={softwareLicense} />
        
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
          <ProductSupport 
            productId={productId} 
            productName={productName} 
            sellerEmail={sellerEmail} 
            sellerFullName={sellerFullName} 
          />
        </div>

        <RefundPolicy />
      </div>
    </div>
  )
} 