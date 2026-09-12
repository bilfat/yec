import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "dark" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yec-amber focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-yec-amber text-yec-white hover:bg-yec-amber-dark shadow-sm hover:shadow": variant === "primary",
            "bg-yec-cream text-yec-brown hover:bg-yec-cream/80": variant === "secondary",
            "bg-yec-brown text-yec-white hover:bg-yec-brown/90 shadow-sm": variant === "dark",
            "border border-[#DDD3C7] bg-transparent hover:bg-yec-paper text-yec-text": variant === "outline",
            "hover:bg-yec-paper text-yec-text hover:text-yec-brown": variant === "ghost",
            "h-9 rounded-xl px-3.5 text-xs sm:text-sm font-semibold": size === "sm",
            "h-11 rounded-xl px-4 sm:px-5 text-sm sm:text-base font-semibold": size === "md",
            "h-12 sm:h-14 rounded-2xl px-6 sm:px-8 text-base sm:text-lg font-bold": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
