import { cn } from "@/lib/utils";
import * as React from "react";
import { Button } from "./button";
import { Upload } from "lucide-react";

interface CodebaseUploadProps extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value?: string | null;
  onChange?: (file: File) => void;
}

const CodebaseUpload = React.forwardRef<HTMLInputElement, CodebaseUploadProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
      inputRef.current?.click();
    };

    return (
      <div
        className={cn(
          "relative flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 text-sm ring-offset-background shadow-sm shadow-black/5 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <Button
          type="button"
          variant="ghost"
          className="h-full -ml-3 rounded-l-lg border-r px-3 font-normal hover:bg-muted"
          onClick={handleClick}
        >
          <Upload className="h-4 w-4 mr-2 shrink-0" />
          Choose File
        </Button>
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && onChange) {
              onChange(file);
            }
          }}
          ref={(el) => {
            // Handle both refs
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
            inputRef.current = el;
          }}
          {...props}
        />
        <div className="flex-1 truncate pl-3">
          {value ? (
            <span className="text-foreground">File selected</span>
          ) : (
            <span className="text-muted-foreground/70 italic">No file chosen</span>
          )}
        </div>
      </div>
    );
  }
);

CodebaseUpload.displayName = "CodebaseUpload";

export { CodebaseUpload }; 