import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-yec-amber focus:ring-offset-2",
        {
          "border-transparent bg-gray-100 text-yec-text": variant === "default",
          "border-transparent bg-success/15 text-success": variant === "success",
          "border-transparent bg-warning/15 text-warning": variant === "warning",
          "border-transparent bg-danger/15 text-danger": variant === "danger",
          "border-transparent bg-info/15 text-info": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
