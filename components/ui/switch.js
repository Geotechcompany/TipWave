"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600" : "bg-gray-700",
        className
      )}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
})

Switch.displayName = "Switch"

export { Switch } 