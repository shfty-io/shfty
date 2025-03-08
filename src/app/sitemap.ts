import { MetadataRoute } from 'next'
import { createClient } from '@/lib/server'
import { cookies } from 'next/headers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(await cookies())
  
  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, updated_at, byline')
    .eq('status', 'approved')

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('status', 'active')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // Add category pages
    ...(categories?.map(category => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })) || []),
    // Product pages
    ...(products?.map(product => ({
      url: `${baseUrl}/product/${product.byline || product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []),
    // Add other important routes like categories, about, etc.
  ]
} 