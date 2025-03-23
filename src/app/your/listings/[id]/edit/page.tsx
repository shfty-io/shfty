import { redirect } from 'next/navigation';
import { createServerComponentClient, createServiceClient } from '@/lib/server';
import { ProductFormData } from '@/components/seller/ProductEditForm';
import { revalidatePath } from 'next/cache';
import { EditPageContent } from './page.client';
import { notFound } from 'next/navigation';

// Define types for the page props
type Params = { id: string };
type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

export default async function EditProductPage(props: PageProps) {
  // Await the params object before accessing its properties
  const params = await props.params;
  const id = params.id;
  
  const supabase = await createServerComponentClient();
  const serviceClient = createServiceClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect(`/auth/login?redirect=/your/listings/${id}/edit`);
  }

  // Fetch product details using service role client
  const { data: product, error: productError } = await serviceClient
    .from('products')
    .select('*, demo_url, image_positions')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (productError || !product) {
    notFound();
  }

  async function handleSubmit(formData: ProductFormData) {
    'use server';
    
    const supabase = await createServerComponentClient();
    const serviceClient = createServiceClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Unauthorized' };
    }

    // Validate minimum price of $4.99 for paid products
    if (formData.price > 0 && formData.price < 4.99) {
      return { error: 'Minimum price for paid products is $4.99' };
    }

    // Use service role client for database operations
    const { error } = await serviceClient
      .from('products')
      .update({
        name: formData.name,
        short_description: formData.shortDescription,
        description: formData.description,
        price: formData.price,
        categories: formData.categories,
        features: formData.features,
        technologies: formData.technologies,
        image_urls: formData.imageUrls,
        image_positions: formData.imagePositions || null,
        software_license: formData.softwareLicense,
        demo_url: formData.demoUrl,
        video_url: formData.videoUrl,
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