import * as SeparatorPrimitive from '@radix-ui/react-separator'

export function Separator({ className = '', vertical = false, ...props }) {
  return (
    <SeparatorPrimitive.Root
      decorative
      orientation={vertical ? 'vertical' : 'horizontal'}
      className={`shrink-0 bg-line data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px ${className}`}
      {...props}
    />
  )
}
