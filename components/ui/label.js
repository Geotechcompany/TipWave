"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const Label = React.forwardRef(({ className, htmlFor, ...props }, ref) => {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-gray-300 block mb-1",
        className
      )}
      {...props}
    />
  )
})

Label.displayName = "Label"

export { Label } 