import { Button } from "@/components/ui/button"
import { Mail, Flag } from "lucide-react"

interface ProductSupportProps {
  productId: string
  productName: string
  sellerEmail: string | null
}

export function ProductSupport({ productId, productName, sellerEmail }: ProductSupportProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Support</h2>
      
      {/* Contact Seller */}
      {sellerEmail && (
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`mailto:${sellerEmail}`} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Seller
            </a>
          </Button>
        </div>
      )}
      
      {/* Report Button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" className="text-red-600 hover:text-red-700" asChild>
          <a href={`mailto:support@yourplatform.com?subject=Report Product: ${productName}&body=Product ID: ${productId}`} className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Report this product
          </a>
        </Button>
      </div>
    </div>
  )
} 