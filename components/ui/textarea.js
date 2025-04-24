"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm",
        "placeholder:text-gray-500 text-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"

export { Textarea } 