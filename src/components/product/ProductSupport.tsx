import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { ReportDialog } from "./ReportDialog"

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
        <ReportDialog productId={productId} productName={productName} />
      </div>
    </div>
  )
} 