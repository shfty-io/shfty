import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Package, Trash } from 'lucide-react';

export default async function ListingsPage() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/auth/login');
  }

  // Fetch user's products
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      categories,
      created_at,
      updated_at,
      status,
      short_description
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Listings</h1>
        <Link href="/your/sell">
          <Button>
            Create New Listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {products?.length ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                <p className="text-muted-foreground line-clamp-2 mb-2">
                  {product.short_description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Price: ${product.price}
                  </span>
                  <span className="text-muted-foreground">
                    Categories: {product.categories?.join(', ')}
                  </span>
                  <span className="text-muted-foreground">
                    Status: {product.status}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 self-end sm:self-center">
                <Link href={`/your/listings/${product.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <form action={`/api/products/${product.id}/delete`} method="POST">
                  <Button variant="destructive" size="sm">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start selling by creating your first product listing
            </p>
            <Link href="/your/sell">
              <Button>Create Your First Listing</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 