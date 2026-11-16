import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export const TooltipProvider = TooltipPrimitive.Provider

export const Tooltip = ({ label, children }) => (
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={8}
        className="z-50 select-none border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fg shadow-lg data-[state=delayed-open]:opacity-100"
      >
        {label}
        <TooltipPrimitive.Arrow width={10} height={5} className="fill-panel" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
)
