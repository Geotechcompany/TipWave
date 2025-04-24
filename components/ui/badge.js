"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  ...props 
}, ref) => {
  const variantStyles = {
    default: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    secondary: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    destructive: "bg-red-500/20 text-red-400 border-red-500/50",
    outline: "bg-transparent border-gray-600 text-gray-300",
    success: "bg-green-500/20 text-green-400 border-green-500/50",
    warning: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge } 