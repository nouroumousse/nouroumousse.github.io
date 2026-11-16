import React from 'react'
import { profile } from '../data'
import { Button } from './ui/button'

const words = ['brand identity', 'app icons', 'type design', 'art direction', 'illustration']

/** tiny typewriter hook — no dependencies */
function useTypewriter(list, { speed = 70, pause = 1600 } = {}) {
  const [text, setText] = React.useState('')
  const state = React.useRef({ i: 0, j: 0, del: false })
  React.useEffect(() => {
    let t
    const tick = () => {
      const s = state.current
      const word = list[s.i]
      if (!s.del) {
        s.j++
        setText(word.slice(0, s.j))
        if (s.j === word.length) {
          s.del = true
          t = setTimeout(tick, pause)
          return
        }
        t = setTimeout(tick, speed)
      } else {
        s.j--
        setText(word.slice(0, s.j))
        if (s.j === 0) {
          s.del = false
          s.i = (s.i + 1) % list.length
        }
        t = setTimeout(tick, speed / 2.5)
      }
    }
    t = setTimeout(tick, 400)
    return () => clearTimeout(t)
  }, [list, speed, pause])
  return text
}

export default function Hero() {
  const typed = useTypewriter(words)

  return (
    <section id="top" className="relative flex min-h-[92vh] items-center overflow-hidden pt-14">
      {/* oversized ghost glyph */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 select-none font-mono text-[26rem] leading-none text-fg/[0.03] lg:block"
      >
        N/
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-8">
        {/* status line */}
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-acid opacity-60" />
              <span className="relative inline-flex h-2 w-2 bg-acid" />
            </span>
            {profile.status}
          </span>
          <span className="text-faint">//</span>
          <span>{profile.location}</span>
          <span className="text-faint">//</span>
          <span>EST. 2016</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-light leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">
          Design that
          <br />
          <span className="italic text-muted">whispers,</span>{' '}
          <span className="font-medium">doesn&apos;t</span>
          <br />
          shout<span className="text-acid">.</span>
        </h1>

        <p className="mt-10 max-w-xl font-mono text-sm leading-relaxed text-muted">
          <span className="text-faint">$ </span>
          I&apos;m {profile.name.split(' ')[0]} — {profile.role.toLowerCase()} crafting{' '}
          <span className="caret text-acid normal-case">{typed}</span>
        </p>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          {profile.tagline.join(' ')}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a href="#work">
            <Button>View work ↓</Button>
          </a>
          <a href="#contact">
            <Button variant="outline">Get in touch</Button>
          </a>
        </div>
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-faint sm:block">
        scroll_
      </div>
    </section>
  )
}
