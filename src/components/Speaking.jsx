import { talks } from '../data'

const tickerItems = [
  'LOGOLOUNGE BOOK 13 — 15 LOGOS SELECTED',
  'LOGOLOUNGE BOOK 12 — 13 LOGOS SELECTED',
  'BEHANCE FEATURED ×4',
  'DEVOXXMA 2023 & 2024 SPEAKER',
  'BYMOROCCANS — FOUNDER & CURATOR',
  'REMOTE — FEEL FREE TO CHANGE MY MIND',
]

export default function Speaking() {
  return (
    <section id="speaking" className="mx-auto max-w-6xl scroll-mt-14 px-4 py-24 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-acid">03 // speaking &amp; community</p>
      <h2 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">
        On stage &amp; in public<span className="text-acid">_</span>
      </h2>

      <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2">
        {talks.map((t) => (
          <li key={t.title} className="bg-ink">
            <a
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col justify-between gap-8 p-6 transition-colors duration-200 hover:bg-panel sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-faint transition-colors group-hover:border-acid group-hover:text-acid">
                  {t.kind}
                </span>
                <span className="font-mono text-sm text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid">
                  ↗
                </span>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{t.event}</p>
                <h3 className="mt-2 text-lg font-light leading-snug tracking-tight text-fg">
                  {t.title}
                </h3>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {/* marquee ticker */}
      <div className="relative mt-16 overflow-hidden border-y border-line py-3">
        <div className="ticker-track flex w-max gap-12 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-12 font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
              {item} <span className="text-acid">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
