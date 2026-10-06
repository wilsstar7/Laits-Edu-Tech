import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Native <select> styled like <Input>. Preferred over a custom listbox for
 * forms: best mobile UX, full keyboard + screen reader support, and works
 * with react-hook-form `register()` out of the box.
 */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-input bg-card py-2 pr-10 pl-3.5 text-base text-foreground shadow-[0_1px_2px_rgba(23,24,28,0.03)] transition-[color,box-shadow,border-color] outline-none hover:border-[rgba(20,20,30,0.22)] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/15 md:text-sm",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-subtle"
      />
    </div>
  )
}

export { NativeSelect }
