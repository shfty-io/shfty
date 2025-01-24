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
  const [message, setMessage] = useState<string>("");

  const checkBylineAvailability = debounce(async (value: string) => {
    if (!value) {
      setIsAvailable(null);
      setMessage("");
      return;
    }

    try {
      setIsChecking(true);
      const response = await fetch(`/api/products/check-byline?byline=${encodeURIComponent(value)}`);
      const data = await response.json();
      
      setIsAvailable(data.available);
      setMessage(data.error || data.message || "");
      onBylineAvailable(data.available);
    } catch (error) {
      console.error("Error checking byline availability:", error);
      setIsAvailable(null);
      setMessage("Error checking availability");
    } finally {
      setIsChecking(false);
    }
  }, 500);

  useEffect(() => {
    checkBylineAvailability(byline);
    return () => checkBylineAvailability.cancel();
  }, [byline]);

  // Auto-format input to be URL-safe
  const handleBylineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setByline(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="byline">Product Byline (URL Slug)</Label>
      <div className="relative">
        <Input
          id="byline"
          value={byline}
          onChange={handleBylineChange}
          placeholder="your-product-name"
          className={isAvailable === false ? "border-red-500" : isAvailable === true ? "border-green-500" : ""}
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
      <div className="text-sm space-y-1">
        <p className="text-muted-foreground">
          This will be your product's URL: /product/{byline || 'your-byline'}
        </p>
        {message && (
          <p className={`${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
} 