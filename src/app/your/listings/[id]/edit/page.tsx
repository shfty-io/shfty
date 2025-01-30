import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { ProductForm, ProductFormData } from '@/components/seller/ProductForm';
import { revalidatePath } from 'next/cache';

export default async function EditProductPage({
  params
}: {
  params: { id: string }
}) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect('/auth/login');
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
    
    const supabase = createClient();
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product - {product.name}</h1>
      <ProductForm
        onSubmit={handleSubmit}
        initialData={{
          name: product.name,
          byline: product.byline,
          shortDescription: product.short_description,
          description: product.description || '',
          price: product.price,
          categories: product.categories || [],
          faq: product.faq || [],
          technologies: product.technologies || [],
          imageUrls: product.image_urls || []
        }}
      />
    </div>
  );
} 