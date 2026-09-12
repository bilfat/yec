import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-yec-white px-3.5 py-2 text-sm md:text-base text-yec-text transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-yec-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-danger focus-visible:ring-danger"
            : "border-[#DDD3C7] focus-visible:border-yec-amber focus-visible:ring-yec-amber/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
