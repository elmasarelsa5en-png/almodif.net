'use client';

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

// Global state لإدارة جميع القوائم المفتوحة
let globalOpenDropdowns: Set<(open: boolean) => void> = new Set()

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  
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
    <DropdownMenuContext.Provider value={{ open, setOpen: setOpenEnhanced }}>
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
  
  const { open, setOpen } = context
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      'data-dropdown-trigger': 'true',
      ref
    })
  }
  
  return (
    <button
      ref={ref}
      className={cn("cursor-pointer", className)}
      onClick={handleClick}
      data-dropdown-trigger="true"
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
  
  const { open, setOpen } = context
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  // تعديل موضع القائمة تلقائياً لتبقى داخل الشاشة
  React.useEffect(() => {
    if (open && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // تحقق من الخروج من اليمين
      if (rect.right > viewportWidth) {
        contentRef.current.style.left = 'auto'
        contentRef.current.style.right = '0'
      }
      
      // تحقق من الخروج من اليسار
      if (rect.left < 0) {
        contentRef.current.style.left = '0'
        contentRef.current.style.right = 'auto'
      }
      
      // تحقق من الخروج من الأسفل
      if (rect.bottom > viewportHeight) {
        contentRef.current.style.maxHeight = `${viewportHeight - rect.top - 20}px`
      }
    }
  }, [open])
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // تحقق من أن الضغط ليس على المحتوى نفسه أو على الزر
      if (contentRef.current && !contentRef.current.contains(target)) {
        // تأكد أن الضغط ليس على أي trigger button
        const triggers = document.querySelectorAll('[data-dropdown-trigger]')
        let isClickOnTrigger = false
        triggers.forEach(trigger => {
          if (trigger.contains(target)) {
            isClickOnTrigger = true
          }
        })
        
        if (!isClickOnTrigger) {
          setOpen(false)
        }
      }
    }
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    
    if (open) {
      // استخدم timeout صغير لتجنب إغلاق القائمة فوراً بعد فتحها
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)
      }, 0)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [open, setOpen])
  
  // دمج refs
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement)
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-xl dropdown-content z-50",
        "max-w-[calc(100vw-2rem)]", // عرض أقصى مع margin
        align === 'end' && 'right-0',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        "bottom-auto top-[calc(100%+8px)]", // تأكد من ظهور القائمة أسفل الزر
        // تأكد من أن القائمة تبقى داخل الشاشة
        "max-h-[calc(100vh-120px)] overflow-y-auto",
        // للجوال: تأكد من عدم الخروج من الشاشة
        "md:max-w-[90vw]",
        className
      )}
      style={{
        // تأكد من أن القائمة لا تخرج من الشاشة على اليمين
        maxWidth: 'min(90vw, 400px)',
      }}
      {...props}
    >
      {children}
    </div>
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
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
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
      "px-2 py-1.5 text-sm font-semibold text-gray-900",
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
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
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
      "min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-lg dropdown-content",
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
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100",
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
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100",
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
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100",
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