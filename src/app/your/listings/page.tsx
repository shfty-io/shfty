"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Package, Trash } from 'lucide-react';
import { User } from '@supabase/supabase-js';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  created_at: string;
  updated_at: string;
  status: string;
  short_description: string;
};

export default function ListingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadUserAndProducts() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth error in listings page:', error);
          router.push('/auth/login');
          return;
        }
        
        setUser(user);
        
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
          
        setProducts(products || []);
      } catch (error) {
        console.error('Error loading listings data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserAndProducts();
  }, [supabase, router]);
  
  if (isLoading) {
    return <div className="min-h-[40vh] flex items-center justify-center">Loading your listings...</div>;
  }
  
  if (!user) return null; // User redirected, don't render anything

  return (
    <div>
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