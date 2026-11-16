import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

/**
 * shadcn-style Button built on @radix-ui/react-slot.
 * Terminal / blueprint aesthetic: square corners, mono type, hairline borders.
 */
const variants = {
  solid:
    'bg-acid text-ink border border-acid hover:bg-transparent hover:text-acid',
  outline:
    'bg-transparent text-fg border border-line hover:border-acid hover:text-acid',
  ghost:
    'bg-transparent text-muted border border-transparent hover:text-fg hover:bg-panel',
}

export function Button({ asChild = false, variant = 'solid', className = '', ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-3 transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-acid disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
