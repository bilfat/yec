import * as React from "react"
import { cn } from "@/lib/utils"

interface ScoreInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number | undefined
  onChange: (value: number) => void
  error?: string
}

export const ScoreInput = React.forwardRef<HTMLInputElement, ScoreInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === "") {
        onChange(0)
        return
      }
      
      const num = parseInt(val, 10)
      if (!isNaN(num)) {
        // Constrain between 0 and 100
        const constrained = Math.max(0, Math.min(100, num))
        onChange(constrained)
      }
    }

    return (
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value === undefined ? "" : value}
          onChange={handleChange}
          ref={ref}
          className={cn(
            "flex h-11 w-24 rounded-xl border bg-yec-white px-3 py-2 text-center text-lg font-bold text-yec-text transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-yec-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]",
            error
              ? "border-danger focus-visible:ring-danger text-danger"
              : "border-[#DDD3C7] focus-visible:border-yec-amber focus-visible:ring-yec-amber/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="absolute top-full mt-1 left-0 text-xs text-danger whitespace-nowrap">
            {error}
          </p>
        )}
      </div>
    )
  }
)
ScoreInput.displayName = "ScoreInput"
