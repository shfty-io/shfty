"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth error in account page:', error);
          router.push('/auth/login');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUser();
  }, [supabase, router]);
  
  if (isLoading) {
    return <div className="min-h-[40vh] flex items-center justify-center">Loading account settings...</div>;
  }
  
  if (!user) return null; // User redirected, don't render anything

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          <form action="/auth/reset-password" method="POST">
            <button
              type="submit"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Change Password
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your account</p>
              </div>
              <form action="/api/notifications/toggle" method="POST">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="emailNotifications"
                    defaultChecked={user.user_metadata.email_notifications}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </form>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
          <div className="space-y-4">
            <SignOutButton />
            <form action="/api/account/delete" method="POST">
              <button
                type="submit"
                className="text-red-600 hover:underline"
              >
                Delete Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 