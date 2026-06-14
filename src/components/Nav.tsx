import { useEffect, useState } from 'react'

const links = ['home', 'about', 'experience', 'projects', 'skills', 'contact']

export default function Nav() {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const sections = links.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { threshold: [0.25, 0.45, 0.65] })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="brand" href="#home" aria-label="Go to Home">
          <span className="brand__dot"></span>
          <span className="brand__name">Nathan Tran</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {links.map(id => (
            <a
              key={id}
              href={`#${id}`}
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