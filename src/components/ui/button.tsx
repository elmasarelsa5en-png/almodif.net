import React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", onClick, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    const mobileResponsive = "sm:text-base sm:py-2 sm:h-9 text-[11px] py-0 h-6 min-w-0 px-1"
    const variants = {
      default: "bg-blue-600 text-white shadow hover:bg-blue-700 border border-blue-600 hover:border-blue-700",
      outline: "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-200",
      link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700"
    }
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9"
    }

    const handleVibrationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // تفعيل اهتزاز قصير (20ms) عند الضغط
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      // استدعاء دالة onClick الأصلية إذا كانت موجودة
      onClick?.(event);
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], mobileResponsive, className)}
        ref={ref}
        onClick={handleVibrationClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }