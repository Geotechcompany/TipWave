"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800",
    ghost: "bg-transparent text-gray-300 hover:bg-gray-800",
    link: "text-blue-500 underline-offset-4 hover:underline bg-transparent",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 py-1 text-sm",
    lg: "h-12 px-6 py-3 text-lg",
    icon: "h-9 w-9",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button } 