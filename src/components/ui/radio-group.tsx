'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value: string
  setValue: (value: string) => void
  name: string
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  name?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, name = "radio-group", ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }
    
    return (
      <RadioGroupContext.Provider value={{ value: currentValue, setValue, name }}>
        <div className={cn("grid gap-2", className)} {...props} ref={ref} />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLLabelElement> {
  value: string
  id?: string
}

const RadioGroupItem = React.forwardRef<HTMLLabelElement, RadioGroupItemProps>(
  ({ className, value, id, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    if (!context) throw new Error('RadioGroupItem must be used within RadioGroup')
    
    const { value: groupValue, setValue, name } = context
    const isChecked = groupValue === value
    const itemId = id || `${name}-${value}`
    
    return (
      <label
        ref={ref}
        htmlFor={itemId}
        className={cn(
          "flex items-center space-x-2 cursor-pointer",
          className
        )}
        {...props}
      >
        <input
          type="radio"
          id={itemId}
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => setValue(value)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
        />
        {children && (
          <span className="text-sm font-medium text-gray-900">
            {children}
          </span>
        )}
      </label>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }