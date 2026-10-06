import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 py-2 text-base text-foreground shadow-[0_1px_2px_rgba(23,24,28,0.03)] transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-subtle hover:border-[rgba(20,20,30,0.22)] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
