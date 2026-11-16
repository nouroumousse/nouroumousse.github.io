import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogContent = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm data-[state=open]:animate-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 border border-line bg-panel p-6 shadow-2xl focus:outline-none sm:p-8 ${className}`}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-4 top-4 font-mono text-xs text-muted transition-colors hover:text-acid focus-visible:outline focus-visible:outline-1 focus-visible:outline-acid"
      >
        [ESC] ✕
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export const DialogTitle = ({ className = '', ...props }) => (
  <DialogPrimitive.Title
    className={`font-mono text-[10px] uppercase tracking-[0.3em] text-muted ${className}`}
    {...props}
  />
)

export const DialogDescription = ({ className = '', ...props }) => (
  <DialogPrimitive.Description
    className={`text-sm leading-relaxed text-muted ${className}`}
    {...props}
  />
)
