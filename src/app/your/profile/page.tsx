"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/client';
import { formatCurrency } from '@/lib/utils';
import { User } from '@supabase/supabase-js';
import { EarningsPanel } from '@/components/earnings/EarningsPanel';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    productsListed: 0,
    totalPurchases: 0,
    totalSales: 0,
  });
  
  const supabase = createClient();
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth error in profile page:', error);
          router.push('/auth/login?redirect=/your/profile');
          return;
        }
        
        setUser(user);
        
        // Fetch account statistics
        const [
          { count: productsListed },
          { count: totalPurchases },
          { data: salesData }
        ] = await Promise.all([
          // Products Listed
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
            
          // Total Purchases
          supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
            
          // Modified Total Sales query
          supabase
            .from('purchases')
            .select(`
              product:products (
                price,
                user_id
              )
            `)
            .eq('product.user_id', user.id)
        ]);
        
        // Fixed sales calculation
        const totalSales = salesData?.reduce((acc, purchase) => 
          acc + (purchase.product?.[0]?.price || 0), 0) || 0;
          
        setStats({
          productsListed: productsListed || 0,
          totalPurchases: totalPurchases || 0,
          totalSales,
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [supabase, router]);
  
  if (isLoading) {
    return <div className="min-h-[40vh] flex items-center justify-center">Loading profile data...</div>;
  }
  
  if (!user) return null; // User redirected, don't render anything
  
  return (
    <div className="container mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="mt-1">{new Date(user?.created_at || "").toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Account Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(stats.totalSales)}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Products Listed</p>
                <p className="text-2xl font-semibold">{stats.productsListed}</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-semibold">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Earnings Panel */}
      <EarningsPanel />
    </div>
  );
} 