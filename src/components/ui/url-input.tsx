import { cn } from "@/lib/utils";
import * as React from "react";

const UrlInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <div className="flex rounded-md">
        <span className="inline-flex items-center rounded-s-md border border-input bg-background px-3 text-sm text-muted-foreground">
          https://
        </span>
        <input
          type="text"
          className={cn(
            "flex h-10 w-full rounded-s-none rounded-e-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 -ml-px",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
UrlInput.displayName = "UrlInput";

export { UrlInput }; 