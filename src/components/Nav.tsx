import { useEffect, useState } from 'react'

const links = ['home', 'about', 'experience', 'projects', 'skills', 'contact']

/** Pointer must come within this many px of the top edge to summon the nav. */
const REVEAL_BAND = 96

export default function Nav() {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const [nearTop, setNearTop] = useState(false)

  useEffect(() => {
    const sections = links.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    // Whichever section is crossing a thin band at the vertical middle of the
    // viewport is "active" — robust regardless of section heights.
    const io = new IntersectionObserver((entries) => {
      const hit = entries.find(e => e.isIntersecting)
      if (hit) setActive(hit.target.id)
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  // The nav tucks away once you leave Home so sections get the full viewport;
  // moving the pointer to the top edge summons it back.
  useEffect(() => {
    const onMove = (e: MouseEvent) => setNearTop(e.clientY <= REVEAL_BAND)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Always shown on Home; elsewhere only while summoned or while the mobile
  // menu is open. CSS additionally pins it open on :focus-within (keyboard)
  // and on touch devices, which have no hover to summon it with.
  const shown = active === 'home' || nearTop || open

  return (
    <header className={`nav${shown ? '' : ' is-tucked'}`}>
      <div className="nav__inner">
        <a className="brand" href="#home" aria-label="Go to Home" onClick={() => setOpen(false)}>
          <span className="brand__dot"></span>
          <span className="brand__name">Nathan Tran</span>
        </a>

        <button
          type="button"
          className="nav__burger"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={`nav__links${open ? ' is-open' : ''}`} aria-label="Primary">
          {links.map(id => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={`nav__link${id === 'contact' ? ' nav__cta' : ''}${active === id ? ' active' : ''}`}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
