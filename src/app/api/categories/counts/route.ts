import { createServiceClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use service role client for admin access
    const supabase = createServiceClient();
    
    // Fetch all approved products and their categories
    const { data: products, error } = await supabase
      .from('products')
      .select('categories')
      .eq('status', 'approved');
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // Calculate counts for each category
    const counts: Record<string, number> = {};
    
    // Process all products and count by category
    products?.forEach((product) => {
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach((category: string) => {
          // Convert slugs to database format if needed
          const normalizedCategory = category.includes('-') ? 
            category.replace(/-/g, '_') : category;
          
          counts[normalizedCategory] = (counts[normalizedCategory] || 0) + 1;
        });
      }
    });
    
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Error in category counts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 