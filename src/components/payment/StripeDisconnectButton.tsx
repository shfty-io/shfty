"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface StripeDisconnectButtonProps {
  onDisconnect: () => void;
  stripeAccountId: string;
}

export function StripeDisconnectButton({ onDisconnect, stripeAccountId }: StripeDisconnectButtonProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/seller/stripe-disconnect', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disconnect Stripe account');
      }

      const result = await response.json();

      toast({
        title: "Stripe account disconnected",
        description: result.message || "Your Stripe account has been successfully disconnected.",
      });
      
      // Call the parent component's callback
      onDisconnect();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect Stripe account",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
      setDisconnectDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/seller/stripe-delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete Stripe account');
      }

      const result = await response.json();

      toast({
        title: "Stripe account deleted",
        description: result.message || "Your Stripe account has been permanently deleted.",
      });
      
      // Call the parent component's callback
      onDisconnect();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete Stripe account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Disconnect Button */}
      <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-destructive hover:text-destructive w-full">
            Disconnect Stripe Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Stripe Account</DialogTitle>
            <DialogDescription>
              This will disconnect your Stripe Connect account ({stripeAccountId}) from your seller profile. 
              The account will still exist in Stripe and can be reconnected later. You will not be able to 
              receive payments until you reconnect.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDisconnectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleDisconnect();
              }}
              variant="destructive"
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Permanently Delete Stripe Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Permanently Delete Stripe Account</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              <p className="font-semibold text-destructive mb-2">Warning: This action cannot be undone!</p>
              <p>This will permanently delete your Stripe Connect account ({stripeAccountId}) from Stripe&apos;s system. All data associated with this account will be permanently lost.</p>
              <p className="mt-2">You will need to create a completely new account if you want to sell on the platform again.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleDelete();
              }}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Permanently Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 