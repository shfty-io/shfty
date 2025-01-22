'use server'

import { createClient } from '@/lib/server'

export async function incrementViewCount(productId: string) {
  const supabase = createClient()
  
  try {
    await supabase.rpc('increment_view_count', {
      product_id: productId
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }
} 