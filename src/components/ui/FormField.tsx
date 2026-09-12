import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./Label"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  htmlFor?: string
  error?: string
  helperText?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, htmlFor, error, helperText, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <Label htmlFor={htmlFor} className={error ? "text-danger" : ""}>
          {label}
        </Label>
        {children}
        {error && (
          <p className="text-sm font-medium text-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-yec-text-muted">{helperText}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }
