"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn("relative w-full", className)} ref={ref} {...props}>
    {children}
  </div>
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm",
      "placeholder:text-gray-500 text-white",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex-grow text-left", className)}
    {...props}
  >
    {children}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-gray-700 bg-gray-800 shadow-lg",
      className
    )}
    {...props}
  >
    <div className="p-1">
      {children}
    </div>
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none text-gray-200",
      "hover:bg-gray-700 hover:text-white",
      "focus:bg-gray-700 focus:text-white",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } 