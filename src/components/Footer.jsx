import { profile } from '../data'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 font-mono text-[10px] uppercase tracking-[0.25em] text-faint sm:flex-row sm:items-center sm:px-8">
        <span>
          © {YEAR} {profile.name} — all rights reserved
        </span>
        <span className="flex items-center gap-2">
          built with <span className="text-muted">react + vite + tailwind + radix-ui</span>
          <span className="inline-block h-1.5 w-1.5 bg-acid" aria-hidden="true" />
        </span>
        <a href="#top" className="transition-colors hover:text-acid">
          back to top ↑
        </a>
      </div>
    </footer>
  )
}
