import React from 'react'
import { experience, education, skills, achievements } from '../data'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Separator } from './ui/separator'

function Entry({ item }) {
  return (
    <article className="group border-l border-line py-6 pl-6 transition-colors hover:border-acid sm:pl-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">{item.period}</p>
      <h4 className="mt-2 text-xl font-light tracking-tight">
        {item.role} <span className="text-muted">/ {item.org}</span>
      </h4>
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
        {item.points.map((pt) => (
          <li key={pt} className="flex gap-3">
            <span className="select-none text-faint transition-colors group-hover:text-acid">—</span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function About() {
  return (
    <section id="about" className="border-y border-line bg-panel/40">
      <div className="mx-auto max-w-6xl scroll-mt-14 px-4 py-24 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.6fr]">
          {/* left — bio */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-acid">02 // about</p>
            <h2 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">
              Biography<span className="text-acid">_</span>
            </h2>
            <p className="mt-8 text-base leading-relaxed text-muted">
              Hi, I&apos;m <span className="text-fg">Nour Oumousse</span>, a Brand Designer with over{' '}
              <span className="text-fg">9 years</span> of experience creating impactful identities.
              Passionate about minimalist aesthetics, app icon design, type design, and brand
              development — currently crafting identities at OD LLC, previously Art Director at
              eBrands &amp; Partners.
            </p>

            <Separator className="my-8" />

            <dl className="space-y-3 font-mono text-[11px] uppercase tracking-[0.2em]">
              {[
                ['name', 'Nour Oumousse'],
                ['based', 'Rabat, Morocco'],
                ['focus', 'Identity · Icons · Type'],
                ['langs', 'EN / FR / AR'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-faint">{k}</dt>
                  <dd className="text-right text-fg">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-3">
              {achievements.map((a) => (
                <a
                  key={a.title}
                  href={a.href}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-panel p-4 transition-colors hover:bg-ink"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-acid">award</p>
                  <p className="mt-2 text-sm text-fg">{a.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{a.text}</p>
                </a>
              ))}
            </div>
          </div>

          {/* right — tabs */}
          <Tabs defaultValue="experience">
            <TabsList>
              <TabsTrigger value="experience">experience.log</TabsTrigger>
              <TabsTrigger value="education">education.log</TabsTrigger>
              <TabsTrigger value="skills">skills.cfg</TabsTrigger>
            </TabsList>

            <TabsContent value="experience" className="space-y-0 divide-y divide-line">
              {experience.map((e) => <Entry key={e.role + e.period} item={e} />)}
            </TabsContent>

            <TabsContent value="education" className="divide-y divide-line">
              {education.map((e) => <Entry key={e.role} item={e} />)}
            </TabsContent>

            <TabsContent value="skills">
              <div className="space-y-10">
                {Object.entries(skills).map(([group, items]) => (
                  <div key={group}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
                      [{group.toLowerCase()}]
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {items.map((s) => (
                        <span
                          key={s}
                          className="border border-line bg-panel px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted transition-colors hover:border-acid hover:text-acid"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
