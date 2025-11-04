'use client';

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
  selectedLabel: string
  setSelectedLabel: (label: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const Select = ({ children, value, onValueChange, defaultValue }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  
  const currentValue = value !== undefined ? value : internalValue
  
  const setValue = (newValue: string) => {
    console.log('✅ setValue called with:', newValue)
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }
  
  return (
    <SelectContext.Provider value={{ open, setOpen, value: currentValue, setValue, triggerRef, selectedLabel, setSelectedLabel }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')
  
  const { open, setOpen, triggerRef } = context
  
  return (
    <button
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string
  }
>(({ className, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')
  
  const { selectedLabel, value } = context
  
  // عرض النص المحفوظ أو placeholder
  const displayText = selectedLabel || value || placeholder
  
  return (
    <span
      ref={ref}
      className={cn("block truncate", !displayText && "text-gray-400", className)}
      {...props}
    >
      {displayText}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within Select')
  
  const { open, setOpen, triggerRef } = context
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
  
  // حساب موقع القائمة
  const updatePosition = React.useCallback(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [open, triggerRef])
  
  React.useEffect(() => {
    if (open) {
      setTimeout(updatePosition, 0)
    }
  }, [open, updatePosition])
  
  React.useEffect(() => {
    if (!open) return
    
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        contentRef.current && 
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    
    if (open) {
      // استخدام setTimeout لتجنب التعارض مع click event
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true)
        document.addEventListener('keydown', handleEscapeKey)
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside, true)
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [open, setOpen, triggerRef])
  
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement)
  
  if (!open || typeof window === 'undefined') return null
  
  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "fixed min-w-[8rem] overflow-hidden rounded-lg border-2 shadow-2xl z-[99999]",
        "bg-white text-gray-900",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        "max-h-[400px] overflow-y-auto",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
      {...props}
    >
      <div className="p-2">
        {children}
      </div>
    </div>,
    document.body
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    disabled?: boolean
  }
>(({ className, children, value, disabled = false, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within Select')
  
  const { setValue, setSelectedLabel, value: selectedValue } = context
  const isSelected = selectedValue === value
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      console.log('🔵 SelectItem clicked:', value, 'Label:', children)
      
      // استخراج النص من children
      let label = ''
      if (typeof children === 'string') {
        label = children
      } else if (React.isValidElement(children)) {
        // إذا كان children عبارة عن element (مثل div مع span)
        const childrenText = extractText(children)
        label = childrenText
      }
      
      setSelectedLabel(label)
      setValue(value)
    }
  }
  
  // دالة لاستخراج النص من React elements
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (!node) return ''
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (React.isValidElement(node)) {
      return extractText(node.props.children)
    }
    return ''
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none transition-all duration-200",
        disabled 
          ? "text-gray-400 cursor-not-allowed opacity-50" 
          : "text-gray-900 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100",
        isSelected && !disabled && "bg-blue-600 text-white font-bold hover:bg-blue-700",
        className
      )}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      role="option"
      aria-selected={isSelected}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-white", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-white/20", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}