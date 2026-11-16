import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

export const Tabs = TabsPrimitive.Root

export const TabsList = ({ className = '', ...props }) => (
  <TabsPrimitive.List
    className={`flex flex-wrap items-center gap-4 border-b border-line pb-0 ${className}`}
    {...props}
  />
)

export const TabsTrigger = ({ className = '', ...props }) => (
  <TabsPrimitive.Trigger
    className={`-mb-px border-b border-transparent pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-fg data-[state=active]:border-acid data-[state=active]:text-acid focus-visible:outline focus-visible:outline-1 focus-visible:outline-acid ${className}`}
    {...props}
  />
)

export const TabsContent = ({ className = '', ...props }) => (
  <TabsPrimitive.Content className={`pt-6 focus:outline-none ${className}`} {...props} />
)
