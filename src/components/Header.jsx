import { useEffect, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { nav } from '../data'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle, DialogClose } from './ui/dialog'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return (
    <span className="font-mono text-[10px] tracking-[0.2em] text-faint tabular-nums">
      {hh}:{mm}<span className="text-acid">:</span>{ss}
    </span>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-ink/85 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-8">
        {/* logo */}
        <a href="#top" className="group flex items-center gap-2 font-mono text-xs tracking-[0.25em]">
          <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeOpacity="0.25" />
            <path d="M9 23V9l14 14V9" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-colors group-hover:text-acid" />
          </svg>
          <span className="text-fg">NOUR_OUMOUSSE</span>
        </a>

        {/* desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <Clock />
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors hover:text-fg"
            >
              <span className="mr-1 text-faint group-hover:text-acid">{item.num}.</span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* mobile menu via Radix Dialog */}
        <Dialog>
          <DialogPrimitive.Trigger asChild>
            <Button variant="ghost" className="md:hidden" aria-label="Open menu">
              [MENU]
            </Button>
          </DialogPrimitive.Trigger>
          <DialogContent className="w-[min(92vw,380px)] text-left">
            <DialogTitle>Navigation</DialogTitle>
            <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
              {nav.map((item) => (
                <DialogClose asChild key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-baseline gap-3 border border-transparent px-3 py-3 font-mono text-sm uppercase tracking-[0.25em] text-fg transition-colors hover:border-line hover:bg-ink hover:text-acid"
                  >
                    <span className="text-[10px] text-faint">{item.num}</span>
                    {item.label}
                  </a>
                </DialogClose>
              ))}
            </nav>
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Rabat, MA</span>
              <Clock />
            </div>
          </DialogContent>
        </Dialog>

        <a href="#contact" className="hidden md:inline-flex">
          <Button variant="outline" className="px-4 py-2">
            Hire me
          </Button>
        </a>
      </div>
    </header>
  )
}
