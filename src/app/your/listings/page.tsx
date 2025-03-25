"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, Edit, Eye, EyeOff, Package, Trash } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  is_visible?: boolean;
  visibility_reason?: string;
};

type SellerAccount = {
  is_onboarded: boolean;
  stripe_account_id: string | null;
  github_token: string | null;
  token_status: string | null;
};

export default function ListingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerAccount, setSellerAccount] = useState<SellerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

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
        
        // Use the API endpoint instead of direct Supabase queries
        const response = await fetch('/api/user/listings');
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setSellerAccount(data.sellerAccount);
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

  const hasHiddenProducts = products.some(product => !product.is_visible);

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

      {hasHiddenProducts && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Some products are hidden from customers</AlertTitle>
          <AlertDescription>
            One or more of your paid products are not visible to customers because you need to connect your 
            {!sellerAccount?.stripe_account_id && " Stripe account"}
            {!sellerAccount?.stripe_account_id && !sellerAccount?.github_token && " and"}
            {!sellerAccount?.github_token && " GitHub account"}.
            {' '}
            <Link href="/your/payment" className="font-medium underline underline-offset-4">
              Update your settings
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {products?.length ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          {product.is_visible ? (
                            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                              <Eye className="h-3 w-3 mr-1" />
                              Visible
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {product.is_visible 
                          ? "This product is visible to customers" 
                          : `This product is hidden from customers. Reason: ${product.visibility_reason}`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
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
                  <input type="hidden" name="redirect" value="/your/listings" />
                  <Button variant="destructive" size="sm" type="submit">
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