"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash-es";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

interface BylineAvailabilityCheckProps {
  initialValue?: string;
  onBylineAvailable: (available: boolean) => void;
}

export function BylineAvailabilityCheck({ 
  initialValue = "",
  onBylineAvailable 
}: BylineAvailabilityCheckProps) {
  const [byline, setByline] = useState(initialValue);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkBylineAvailability = debounce(async (value: string) => {
    if (!value) {
      setIsAvailable(null);
      return;
    }

    try {
      setIsChecking(true);
      const response = await fetch(`/api/products/check-byline?byline=${encodeURIComponent(value)}`);
      const data = await response.json();
      setIsAvailable(data.available);
      onBylineAvailable(data.available);
    } catch (error) {
      console.error("Error checking byline availability:", error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, 500);

  useEffect(() => {
    checkBylineAvailability(byline);
    return () => checkBylineAvailability.cancel();
  }, [byline]);

  return (
    <div className="space-y-2">
      <Label htmlFor="byline">Product Byline (URL Slug)</Label>
      <div className="relative">
        <Input
          id="byline"
          value={byline}
          onChange={(e) => setByline(e.target.value)}
          required
          pattern="^[a-z0-9-]+$"
          title="Only lowercase letters, numbers, and hyphens allowed"
        />
        {byline && (
          <div className="absolute right-3 top-2.5">
            {isChecking ? (
              <span className="animate-pulse">...</span>
            ) : isAvailable === true ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : isAvailable === false ? (
              <X className="h-5 w-5 text-red-600" />
            ) : null}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        This will be your product's URL: /product/{byline || 'your-byline'}
        {isAvailable === false && (
          <span className="text-red-600 ml-2">This byline is already taken</span>
        )}
      </p>
    </div>
  );
} 