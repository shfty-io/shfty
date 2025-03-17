import { Clock, Eye, User } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { LikeButton } from "./LikeButton"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"

interface ProductStatsProps {
  productId: string
  creatorName: string | null
  creatorAvatarUrl: string | null
  updatedAt: string | null
  likesCount: number
  viewCount: number | null | undefined
}

export function ProductStats({ 
  productId,
  creatorName, 
  creatorAvatarUrl, 
  updatedAt, 
  likesCount: initialLikesCount, 
  viewCount 
}: ProductStatsProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const safeViewCount = viewCount || 0
  const supabase = createClient()

  // Fetch the current likes count
  const fetchLikesCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)

      if (!error && count !== null) {
        setLikesCount(count)
      }
    } catch (error) {
      console.error('Error fetching likes count:', error)
    }
  }, [productId, supabase]);

  // Initial fetch and setup realtime subscription
  useEffect(() => {
    // Fetch initial count
    fetchLikesCount()

    // Set up realtime subscription
    const channel = supabase
      .channel(`likes-changes-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          // When likes change, fetch the updated count
          fetchLikesCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, supabase, fetchLikesCount])

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
            <LikeButton productId={productId} />
            <div className="flex flex-col items-center text-sm">
              <span className="font-medium">{likesCount.toLocaleString()}</span>
              <span className="text-muted-foreground">Likes</span>
            </div>
          </div>

          {/* Views */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex flex-col items-center text-sm">
              <span className="font-medium">{safeViewCount.toLocaleString()}+</span>
              <span className="text-muted-foreground">Views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 