'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface LikeButtonProps {
  productId: string
}

export function LikeButton({ productId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Check if user has liked the product
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        const { data } = await supabase
          .from('likes')
          .select('product_id')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .single()

        setIsLiked(!!data)
      } catch (error) {
        // It's okay if this fails - just means user hasn't liked it
        console.error('Error checking like status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLikeStatus()
  }, [productId, supabase])

  const handleLike = async (e: React.MouseEvent) => {
    // Prevent the event from bubbling up to parent elements
    e.stopPropagation()
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like products",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // Call the toggle_like function with correct parameter names
      const { data, error } = await supabase
        .rpc('toggle_like', {
          _product_id: productId,
          _user_id: user.id
        })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // data will be true if liked, false if unliked
      setIsLiked(data)

      // Verify the like status after toggling
      const { data: verifyData, error: verifyError } = await supabase
        .from('likes')
        .select('product_id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single()

      if (!verifyError) {
        setIsLiked(!!verifyData)
      }

      // Clear saved data after successful submission
      localStorage.removeItem('productData');
    } catch (error: Error | unknown) {
      console.error('Error toggling like:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-100"
      onClick={handleLike}
      disabled={isLoading}
      aria-label={isLiked ? "Unlike" : "Like"}
    >
      <Heart 
        className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'} transition-colors`} 
      />
    </Button>
  )
} 