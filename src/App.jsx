import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Work from './components/Work'
import About from './components/About'
import Speaking from './components/Speaking'
import Contact from './components/Contact'
import Footer from './components/Footer'

/** adds .is-visible to .reveal elements as they enter the viewport */
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function App() {
  useReveal()
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-acid focus:bg-panel focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-acid"
      >
        Skip to content
      </a>
      <Header />
      <main>
        <div className="reveal"><Hero /></div>
        <div className="reveal"><Work /></div>
        <div className="reveal"><About /></div>
        <div className="reveal"><Speaking /></div>
        <div className="reveal"><Contact /></div>
      </main>
      <Footer />
    </>
  )
}
