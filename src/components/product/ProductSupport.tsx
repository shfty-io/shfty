import { Button } from "@/components/ui/button"
import { Mail, Megaphone } from "lucide-react"
import { ReportDialog } from "./ReportDialog"

interface ProductSupportProps {
  productId: string
  productName: string
  sellerEmail: string | null
  sellerFullName: string | null
}

export function ProductSupport({ productId, productName, sellerEmail, sellerFullName }: ProductSupportProps) {
  return (
    <div className="space-y-4">     
      {/* Contact Seller - only show if sellerEmail exists */}
      {sellerEmail && (
        <Button variant="outline" asChild className="w-full">
          <a 
            href={`mailto:${sellerEmail}?subject=Question about ${encodeURIComponent(productName)}`} 
            className="flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact {sellerFullName || 'Seller'}
          </a>
        </Button>
      )}
      
      {/* Report Button */}
      <ReportDialog productId={productId} productName={productName} />
    </div>
  )
} 