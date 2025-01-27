import { Clock, Eye, User } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { LikeButton } from "./LikeButton"

interface ProductStatsProps {
  productId: string
  creatorName: string | null
  creatorAvatarUrl: string | null
  updatedAt: string | null
  likesCount: number
  viewCount: number
}

export function ProductStats({ 
  productId,
  creatorName, 
  creatorAvatarUrl, 
  updatedAt, 
  likesCount, 
  viewCount 
}: ProductStatsProps) {
  return (
    <div className="space-y-6 w-full">
      <Separator />
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-4 w-full gap-4">
          {/* Creator */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 relative">
              {creatorAvatarUrl ? (
                <Image
                  src={creatorAvatarUrl}
                  alt={creatorName || "Creator"}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-full h-full p-1.5 text-gray-500" />
              )}
            </div>
            <div className="flex flex-col items-center text-sm">
              <span className="font-medium">{creatorName || "Anonymous"}</span>
              <span className="text-muted-foreground">Creator</span>
            </div>
          </div>

          {/* Updated */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex flex-col items-center text-sm">
              <span className="font-medium">
                {updatedAt ? formatDistanceToNow(new Date(updatedAt)) + " ago" : "-"}
              </span>
              <span className="text-muted-foreground">Updated</span>
            </div>
          </div>

          {/* Likes */}
          <div className="flex flex-col items-center gap-2">
            <LikeButton productId={productId} initialLikes={likesCount} />
            <span className="text-sm text-muted-foreground">Likes</span>
          </div>

          {/* Views */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex flex-col items-center text-sm">
              <span className="font-medium">{viewCount.toLocaleString()}+</span>
              <span className="text-muted-foreground">Views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 