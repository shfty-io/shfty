"use client";

import { useState, useRef } from "react";
import { User } from '@supabase/supabase-js';
import { createClient } from "@/lib/client";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

interface Profile {
  email_notifications_enabled: boolean;
  created_at?: string;
  full_name?: string;
  avatar_url?: string;
  id: string;
}

interface AccountSettingsClientProps {
  user: User;
  profile: Profile;
}

export default function AccountSettingsClient({ user, profile: initialProfile }: AccountSettingsClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleNotificationToggle = async (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
    // Handle both direct boolean values and event objects
    const isEnabled = typeof e === 'boolean' ? e : e.target.checked;
    
    // Optimistic UI update - update the state immediately before the API call
    setProfile(prev => ({ ...prev, email_notifications_enabled: isEnabled }));
    
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
      setProfile(prev => ({ ...prev, email_notifications_enabled: !isEnabled }));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUpdating(true);
    
    try {
      const formData = new FormData();
      
      if (fullName) {
        formData.append('fullName', fullName);
      }
      
      if (avatarUrl) {
        formData.append('avatarUrl', avatarUrl);
      }
      
      const response = await fetch('/api/account/update', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        full_name: fullName,
        avatar_url: avatarUrl
      }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept image files
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Create a folder with the user's ID to organize uploads
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);
      
      // Update the avatar URL
      setAvatarUrl(publicUrl);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar image.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="flex justify-center sm:justify-start">
                <div 
                  onClick={handleAvatarClick}
                  className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer relative flex items-center justify-center border border-gray-200"
                >
                  {avatarUrl ? (
                    <Image 
                      src={avatarUrl} 
                      alt="Profile avatar" 
                      width={96} 
                      height={96} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-3xl text-gray-400">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 hover:opacity-100">Change</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="max-w-md"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="max-w-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="member-since">Member Since</Label>
                  <Input
                    id="member-since"
                    value={profile.created_at 
                      ? new Date(profile.created_at).toLocaleDateString() 
                      : new Date(user.created_at).toLocaleDateString()}
                    disabled
                    className="max-w-md"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="mt-2"
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
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