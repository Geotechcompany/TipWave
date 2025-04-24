"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
})

function Tabs({ value, onValueChange, children, className, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children, ...props }) {
  return (
    <div 
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-800/50 p-1 text-gray-400",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTrigger({ value, className, children, ...props }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isActive = selectedValue === value
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-blue-600 text-white shadow-sm" : "hover:bg-gray-700/50 hover:text-gray-300",
        className
      )}
      onClick={() => onValueChange(value)}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, className, children, ...props }) {
  const { value: selectedValue } = React.useContext(TabsContext)
  const isActive = selectedValue === value
  
  if (!isActive) return null
  
  return (
    <div
      className={cn("mt-2", className)}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }