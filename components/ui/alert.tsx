import * as React from "react"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "warning" | "info"
  title?: string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, children, ...props }, ref) => {
    const icons = {
      success: <CheckCircle2 className="h-5 w-5" />,
      error: <XCircle className="h-5 w-5" />,
      warning: <AlertCircle className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />,
    }

    const styles = {
      success: "bg-success/10 border-success/20 text-success",
      error: "bg-destructive/10 border-destructive/20 text-destructive",
      warning: "bg-warning/10 border-warning/20 text-warning",
      info: "bg-primary/10 border-primary/20 text-primary",
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-2xl border-2 p-4",
          styles[variant],
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">{icons[variant]}</div>
          <div className="flex-1">
            {title && <h5 className="font-semibold mb-1">{title}</h5>}
            <div className="text-sm leading-relaxed">{children}</div>
          </div>
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert }
