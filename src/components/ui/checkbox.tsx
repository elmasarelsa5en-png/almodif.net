"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

// Lightweight Checkbox component that doesn't depend on @radix-ui
const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="checkbox"
      {...props}
      className={cn(
        "h-4 w-4 rounded-sm border border-white/30 bg-transparent text-white",
        className
      )}
    />
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
