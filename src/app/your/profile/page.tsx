import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
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
              <p className="text-2xl font-semibold">$0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Products Listed</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 