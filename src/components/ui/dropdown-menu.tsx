'use client';

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

// Global state لإدارة جميع القوائم المفتوحة
let globalOpenDropdowns: Set<(open: boolean) => void> = new Set()

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  
  // دالة محسنة لإغلاق القوائم الأخرى
  const setOpenEnhanced = React.useCallback((newOpen: boolean) => {
    if (newOpen) {
      // أغلق جميع القوائم الأخرى
      globalOpenDropdowns.forEach(closeOther => {
        if (closeOther !== setOpen) {
          closeOther(false)
        }
      })
    }
    setOpen(newOpen)
  }, [])
  
  // تسجيل/إلغاء تسجيل القائمة
  React.useEffect(() => {
    globalOpenDropdowns.add(setOpen)
    return () => {
      globalOpenDropdowns.delete(setOpen)
    }
  }, [])
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen: setOpenEnhanced, triggerRef }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
  }
>(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')
  
  const { open, setOpen, triggerRef } = context
  const internalRef = React.useRef<HTMLElement>(null)
  
  // دمج الـ refs
  React.useEffect(() => {
    if (internalRef.current) {
      triggerRef.current = internalRef.current
    }
  }, [triggerRef])
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      ref: (node: HTMLElement) => {
        internalRef.current = node
        if (typeof ref === 'function') ref(node as any)
        else if (ref) (ref as any).current = node
      }
    })
  }
  
  return (
    <button
      ref={(node) => {
        internalRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn("cursor-pointer", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end'
  }
>(({ className, align = 'center', children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')
  
  const { open, setOpen, triggerRef } = context
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
  
  // حساب موقع القائمة بناءً على موقع الزر
  const updatePosition = React.useCallback(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const contentWidth = contentRef.current?.offsetWidth || 320
      const contentHeight = contentRef.current?.offsetHeight || 400
      
      let left = rect.left + window.scrollX
      let top = rect.bottom + window.scrollY + 8
      const width = rect.width
      
      // تعديل الموقع بناءً على align
      if (align === 'end') {
        left = rect.right + window.scrollX
        left -= contentWidth
      } else if (align === 'center') {
        left = rect.left + window.scrollX + (width / 2)
        left -= contentWidth / 2
      }
      
      // التأكد من عدم الخروج من الشاشة - الحدود اليسرى واليمنى
      const padding = 8 // مسافة أمان من حواف الشاشة
      const viewportWidth = window.innerWidth
      
      // إذا خرجت القائمة من اليمين
      if (left + contentWidth > viewportWidth - padding) {
        left = viewportWidth - contentWidth - padding
      }
      
      // إذا خرجت القائمة من اليسار
      if (left < padding) {
        left = padding
      }
      
      // التأكد من عدم الخروج من الشاشة - أعلى وأسفل
      const viewportHeight = window.innerHeight
      
      // إذا خرجت القائمة من أسفل الشاشة، اعرضها فوق الزر
      if (top + contentHeight > viewportHeight - padding) {
        top = rect.top + window.scrollY - contentHeight - 8
        
        // إذا كانت فوق الشاشة أيضاً، اعرضها بجانب الزر
        if (top < padding) {
          top = padding
        }
      }
      
      setPosition({ top, left, width })
    }
  }, [open, align, triggerRef])
  
  // تحديث الموقع عند الفتح
  React.useEffect(() => {
    if (open) {
      // تأخير صغير للتأكد من أن الـ trigger ref محدث
      setTimeout(updatePosition, 0)
      // تحديث ثاني بعد render علشان نحسب الحجم الفعلي
      setTimeout(updatePosition, 50)
    }
  }, [open, updatePosition])
  
  // تحديث الموقع عند الـ scroll
  React.useEffect(() => {
    if (!open) return
    
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])
  
  // إغلاق عند الضغط خارج القائمة
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
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)
      }, 0)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [open, setOpen, triggerRef])
  
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement)
  
  if (!open || typeof window === 'undefined') return null
  
  // استخدام Portal لعرض القائمة في document.body
  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "fixed min-w-[8rem] overflow-hidden rounded-md border border-white/20 shadow-xl z-[99999]",
        "bg-slate-900/98 backdrop-blur-xl text-white",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        "max-h-[calc(100vh-120px)] overflow-y-auto",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: align === 'start' || align === 'center' ? `${position.width}px` : undefined,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e)
    }
    // أغلق القائمة بعد الضغط على العنصر
    if (context) {
      context.setOpen(false)
    }
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer",
        inset && "pl-8",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-white",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-white/20", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-w-[8rem] overflow-hidden rounded-md border border-white/20 bg-slate-900/98 backdrop-blur-xl p-1 text-white shadow-lg",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-white hover:bg-white/10",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors text-white hover:bg-white/10",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors text-white hover:bg-white/10",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}