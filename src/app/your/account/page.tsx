"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Profile {
  email_notifications_enabled: boolean;
  created_at?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth error in account page:', error);
          router.push('/auth/login');
          return;
        }
        
        setUser(user);
        
        // Load profile data including notification preferences
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email_notifications_enabled, created_at')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error loading profile data:', profileError);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserAndProfile();
  }, [supabase, router]);
  
  const handleNotificationToggle = async (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
    if (!user) return;
    
    // Handle both direct boolean values and event objects
    const isEnabled = typeof e === 'boolean' ? e : e.target.checked;
    
    // Optimistic UI update - update the state immediately before the API call
    setProfile(prev => prev ? {...prev, email_notifications_enabled: isEnabled} : null);
    
    // Set loading state (but don't disable the toggle)
    setIsUpdatingNotifications(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('emailNotifications', isEnabled ? 'on' : 'off');
      
      // Call the API endpoint
      const response = await fetch('/api/notifications/toggle', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Revert the checkbox state in case of an error
      setProfile(prev => prev ? {...prev, email_notifications_enabled: !isEnabled} : null);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };
  
  if (isLoading) {
    return <div className="min-h-[40vh] flex items-center justify-center">Loading account settings...</div>;
  }
  
  if (!user || !profile) return null; // User redirected, don't render anything

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {profile.created_at 
                    ? new Date(profile.created_at).toLocaleDateString() 
                    : new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your account</p>
              </div>
              <div className="relative">
                <Switch
                  id="email-notifications"
                  checked={profile.email_notifications_enabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <SignOutButton />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
      
      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Your Account?</h3>
            <p className="text-gray-700 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
              Are you sure you want to continue?
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-3 justify-end">
              <form action="/api/account/delete" method="POST">
                <Button
                  type="submit"
                  variant="outline"
                >
                  Delete Account
                </Button>
              </form>
              <Button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 