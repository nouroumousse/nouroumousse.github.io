import React from 'react'
import { projects, extras } from '../data'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from './ui/dialog'
import { Tooltip, TooltipProvider } from './ui/tooltip'
import { Button } from './ui/button'

function ProjectDialog({ project, open, onOpenChange }) {
  if (!project) return null
  const idx = projects.findIndex((p) => p.id === project.id)
  const next = projects[(idx + 1) % projects.length]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>case_file — {project.id}.json</DialogTitle>
        <h3 className="mt-4 text-3xl font-light tracking-tight">
          {project.title}
          <span className="ml-3 align-middle font-mono text-xs text-faint">{project.year}</span>
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {t}
            </span>
          ))}
        </div>
        <DialogDescription className="mt-6 text-base">{project.desc}</DialogDescription>
        <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line font-mono text-[11px] sm:grid-cols-4">
          {[
            ['CLIENT', project.title],
            ['ROLE', project.tags.join(' / ')],
            ['YEAR', project.year],
            ['STATUS', 'SHIPPED'],
          ].map(([k, v]) => (
            <div key={k} className="bg-panel p-3">
              <dt className="text-[9px] uppercase tracking-[0.25em] text-faint">{k}</dt>
              <dd className="mt-1 truncate text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <Button asChild>
            <a href={project.href} target="_blank" rel="noreferrer">
              Open live ↗
            </a>
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" >
              close ✕
            </Button>
          </DialogClose>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          next → {next.title}
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default function Work() {
  const [active, setActive] = React.useState(null)
  const [open, setOpen] = React.useState(false)

  const openProject = (p) => {
    setActive(p)
    setOpen(true)
  }

  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-14 px-4 py-24 sm:px-8">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-acid">01 // selected work</p>
          <h2 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">
            Chosen projects<span className="text-acid">_</span>
          </h2>
        </div>
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {extras.map((e) => (
            <a key={e.label} href={e.href} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-acid hover:decoration-acid">
              {e.label} ↗
            </a>
          ))}
        </div>
      </div>

      <TooltipProvider delayDuration={200}>
        <ul className="border-t border-line">
          {projects.map((p, i) => (
            <li key={p.id} className="group border-b border-line">
              <button
                type="button"
                onClick={() => openProject(p)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5 text-left transition-colors duration-200 hover:bg-panel sm:grid-cols-[3rem_1fr_8rem_6rem_2rem] sm:gap-6 sm:px-2"
              >
                <span className="font-mono text-[10px] text-faint group-hover:text-acid">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xl font-light tracking-tight transition-transform duration-300 group-hover:translate-x-2 sm:text-2xl">
                  {p.title}
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
                  {p.tags.join(' · ')}
                </span>
                <span className="hidden font-mono text-[11px] text-faint sm:block tabular-nums">{p.year}</span>
                <span className="justify-self-end font-mono text-sm text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-acid">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          <Tooltip label="Full archive on Behance">
            <a href="https://www.behance.net/NourOumousse" target="_blank" rel="noreferrer" className="transition-colors hover:text-acid">
              behance archive ↗
            </a>
          </Tooltip>
          <Tooltip label="Candy for your eyes">
            <a href="https://dribbble.com/nouroumousse" target="_blank" rel="noreferrer" className="transition-colors hover:text-acid">
              dribbble shots ↗
            </a>
          </Tooltip>
          <Tooltip label="Thoughts on design, written monthly">
            <a href="https://nouroumousse.substack.com/" target="_blank" rel="noreferrer" className="transition-colors hover:text-acid">
              substack notes ↗
            </a>
          </Tooltip>
        </div>
      </TooltipProvider>

      <ProjectDialog project={active} open={open} onOpenChange={setOpen} />
    </section>
  )
}