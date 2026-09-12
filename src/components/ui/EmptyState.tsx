import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className,
  ...props 
}: EmptyStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#DDD3C7] bg-yec-paper/50", className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yec-cream text-yec-amber">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-yec-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-yec-text-secondary max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
