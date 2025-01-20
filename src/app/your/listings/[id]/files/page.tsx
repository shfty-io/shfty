import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export default async function ProductFilesPage({
  params: { id }
}: {
  params: { id: string }
}) {
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Files - {product.name}</h1>

      <div className="grid gap-6">
        {/* Codebase Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Codebase</h2>
          {product.codebase_url ? (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Codebase</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={`/api/products/${id}/codebase`} method="POST">
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </form>
                  <form action={`/api/products/${id}/codebase/delete`} method="POST">
                    <Button variant="destructive" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <form action={`/api/products/${id}/codebase`} method="POST">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Codebase Uploaded</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your product's codebase as a ZIP file
                  </p>
                  <Button>Upload Codebase</Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>
          <div className="grid grid-cols-3 gap-4">
            {product.image_urls?.map((url: string, index: number) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                <Image
                  src={url}
                  alt={`Product ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <form 
                  action={`/api/products/${id}/images/${index}/delete`} 
                  method="POST"
                  className="absolute top-2 right-2 z-10"
                >
                  <Button variant="destructive" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ))}
            {(!product.image_urls || product.image_urls.length < 9) && (
              <form action={`/api/products/${id}/images`} method="POST">
                <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/40 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Add Image</span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Product Video</h2>
          {product.video_url ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <video src={product.video_url} controls className="w-full h-full object-cover" />
              <form 
                action={`/api/products/${id}/video/delete`} 
                method="POST"
                className="absolute top-2 right-2 z-10"
              >
                <Button variant="destructive" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <form action={`/api/products/${id}/video`} method="POST">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 cursor-pointer hover:border-muted-foreground/40 transition-colors">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Video Uploaded</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a demo video of your product
                  </p>
                  <Button>Upload Video</Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 