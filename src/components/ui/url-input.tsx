import { cn } from "@/lib/utils";
import * as React from "react";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface UrlInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const UrlInput = React.forwardRef<HTMLInputElement, UrlInputProps>(
  ({ className, icon = <Globe className="h-4 w-4" />, ...props }, ref) => {
    return (
      <div className="flex rounded-lg shadow-sm shadow-black/5">
        <span className="inline-flex items-center rounded-s-lg border border-input bg-background px-3 text-sm text-muted-foreground">
          https://
        </span>
        <div className="relative flex items-center flex-1">
          <span className="absolute left-3 text-muted-foreground">
            {icon}
          </span>
          <input
            type="text"
            className={cn(
              "flex h-9 w-full rounded-s-none rounded-e-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 -ml-px",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);
UrlInput.displayName = "UrlInput";

export { UrlInput }; 