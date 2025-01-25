import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { formatCurrency } from '@/lib/utils';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/auth/login');
  }

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Member Since</label>
              <p className="mt-1">{new Date(user?.created_at || "").toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Account Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Products Listed</p>
              <p className="text-2xl font-semibold">{productsListed || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-2xl font-semibold">{totalPurchases || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 