import { useEffect, useState } from 'react'

const links = ['home', 'about', 'experience', 'projects', 'skills', 'contact']

export default function Nav() {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)

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

  return (
    <header className="nav">
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
