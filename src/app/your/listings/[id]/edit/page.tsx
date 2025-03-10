import { redirect } from 'next/navigation';
import { createClient, createServerComponentClient } from '@/lib/server';
import { ProductFormData } from '@/components/seller/ProductForm';
import { revalidatePath } from 'next/cache';
import { EditPageContent } from './page.client';

// Define types for the page props
type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  
  const supabase = await createServerComponentClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect(`/auth/login?redirect=/your/listings/${id}/edit`);
  }

  // Fetch product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (productError || !product) {
    return redirect('/your/listings');
  }

  async function handleSubmit(formData: ProductFormData) {
    'use server';
    
    const supabase = await createServerComponentClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        byline: formData.byline,
        short_description: formData.shortDescription,
        description: formData.description,
        price: formData.price,
        categories: formData.categories,
        faq: formData.faq,
        technologies: formData.technologies,
        image_urls: formData.imageUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating product:', error);
      return { error: 'Failed to update product' };
    }

    revalidatePath(`/your/listings/${id}`);
    return { success: true };
  }

  return <EditPageContent product={product} onSubmit={handleSubmit} />;
} 