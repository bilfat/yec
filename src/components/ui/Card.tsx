import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "app" | "public"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "app", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-shadow duration-200",
          {
            "bg-yec-white rounded-[20px] sm:rounded-[24px] border border-[#DDD3C7] shadow-sm": variant === "app",
            "bg-yec-cream rounded-[24px] sm:rounded-[32px] border border-yec-brown/10 shadow-sm": variant === "public",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
