import React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { profile, socials } from '../data'
import { Button } from './ui/button'

const inputCls =
  'w-full border border-line bg-ink px-4 py-3 font-mono text-sm text-fg placeholder:text-faint transition-colors focus:border-acid focus:outline-none'

function Field({ id, label, hint, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <LabelPrimitive.Root
        htmlFor={id}
        className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted"
      >
        {label}
        {hint && <span className="text-faint">{hint}</span>}
      </LabelPrimitive.Root>
      {props.multiline ? (
        <textarea id={id} required className={`${inputCls} min-h-28 resize-y`} {...props} />
      ) : (
        <input id={id} required className={inputCls} {...props} />
      )}
    </div>
  )
}

export default function Contact() {
  const [sent, setSent] = React.useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = `Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\nProject: ${fd.get('message')}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
      `Project inquiry — ${fd.get('name')}`,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section id="contact" className="border-t border-line bg-panel/40">
      <div className="mx-auto grid max-w-6xl scroll-mt-14 gap-16 px-4 py-24 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-acid">04 // contact</p>
          <h2 className="mt-3 text-4xl font-light leading-tight tracking-tight sm:text-6xl">
            Let&apos;s work
            <br />
            together<span className="text-acid">_</span>
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted">
            Freelance project inquiries are always welcome. I wouldn&apos;t want to miss the chance
            to connect with you — drop me a line and we can chat.
          </p>

          <div className="mt-10 space-y-1 font-mono text-xs">
            <a href={`mailto:${profile.email}`} className="flex items-center justify-between border-b border-line py-3 text-muted transition-colors hover:text-acid">
              <span className="text-faint">email</span> {profile.email} ↗
            </a>
            <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="flex items-center justify-between border-b border-line py-3 text-muted transition-colors hover:text-acid">
              <span className="text-faint">phone</span> {profile.phone}
            </a>
            <div className="flex items-center justify-between border-b border-line py-3 text-muted">
              <span className="text-faint">location</span> Rabat, Morocco (UTC+1)
            </div>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em]">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-baseline justify-between gap-2 text-muted transition-colors hover:text-acid"
                >
                  <span>{s.label}</span>
                  <span className="truncate text-faint transition-colors group-hover:text-acid">
                    {s.handle} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* form */}
        <form
          onSubmit={onSubmit}
          className="relative self-start border border-line bg-ink p-6 sm:p-10"
        >
          <div className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            <span>~/new_project Inquiry</span>
            <span className="flex gap-1.5" aria-hidden="true">
              <i className="h-2 w-2 border border-line" />
              <i className="h-2 w-2 border border-line" />
              <i className="h-2 w-2 border border-acid bg-acid" />
            </span>
          </div>

          {sent ? (
            <div className="flex min-h-72 flex-col items-start justify-center gap-4">
              <p className="font-mono text-sm text-acid">&gt; message queued ✓</p>
              <p className="text-sm leading-relaxed text-muted">
                Your mail client should have opened. If not, write directly to{' '}
                <a className="text-fg underline decoration-acid underline-offset-4" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                . Talk soon.
              </p>
              <Button variant="outline" type="button" onClick={() => setSent(false)}>
                ← write another
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Field id="name" name="name" label="// your name" placeholder="Jane Appleseed" />
              <Field id="email" name="email" type="email" label="// email" placeholder="jane@studio.com" />
              <Field
                id="message"
                name="message"
                label="// about the project"
                hint="scope · timeline · budget"
                multiline
                placeholder="We're rebranding our app and need an identity system + icons…"
              />
              <Button type="submit" className="w-full">
                Send transmission →
              </Button>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                opens your mail client · no data stored
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
