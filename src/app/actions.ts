'use server'

import { createClient } from '@/lib/server'

export async function incrementViewCount(bylineOrId: string) {
  const supabase = createClient()
  
  try {
    // Check if the byline is a valid UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bylineOrId);
    
    let productId = bylineOrId;
    
    // If it's not a UUID, we need to fetch the product ID first
    if (!isUUID) {
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('byline', bylineOrId)
        .single();
        
      if (!product) {
        console.error('Product not found for byline:', bylineOrId);
        return;
      }
      
      productId = product.id;
    }
    
    const { error } = await supabase.rpc('increment_product_view', {
      product_id: productId
    });
    
    if (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
} 