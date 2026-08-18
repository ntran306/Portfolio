import { useEffect, useRef } from 'react'
import HomeBall from './HomeBall'
import { hero, links } from '../content'

export default function Home() {
  const bg3dRef = useRef<HTMLDivElement>(null)

  // Parallax tilt
  useEffect(() => {
    const bg3d = bg3dRef.current
    if (!bg3d) return
    let tx = 0, ty = 0, cx = 0, cy = 0
    let raf: number

    const onMouseMove = (e: MouseEvent) => {
      const mx = e.clientX / window.innerWidth
      const my = e.clientY / window.innerHeight
      bg3d.style.setProperty('--mx', (mx * 100).toFixed(2) + '%')
      bg3d.style.setProperty('--my', (my * 100).toFixed(2) + '%')
      tx = (mx - 0.5) * 10
      ty = (0.5 - my) * 10
    }

    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      bg3d.style.transform = `translate3d(0,0,0) rotateX(${cy}deg) rotateY(${cx}deg) scale(1.05)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="home" className="home home--full">
      <div className="home__bg" aria-hidden="true">
        <div className="bg-3d" ref={bg3dRef}>
          <div className="bg-3d__layer bg-3d__layer--a"></div>
          <div className="bg-3d__layer bg-3d__layer--b"></div>
          <div className="bg-3d__layer bg-3d__layer--c"></div>
        </div>
      </div>

      <HomeBall />

      <div className="home__content wrap">
        <div className="home__card reveal">
          <div className="motion-box" id="tiltCard">
            <div className="glass">
              <div className="glass__content">
                <span className="hero__eyebrow">{hero.eyebrow}</span>
                <h1>{hero.headline}</h1>
                <p className="sub">{hero.tagline}</p>
              </div>
            </div>
          </div>
          <div className="hero__buttons">
            <a className="btn btn--primary" href="#projects">
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l9 9-9 9-9-9z"/></svg>
              See Projects
            </a>
            <a className="btn" href={links.resume} target="_blank" rel="noreferrer">
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Resume
            </a>
            <a className="btn" href={links.github} target="_blank" rel="noreferrer">
              <svg className="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </a>
            <a className="btn" href={links.linkedin} target="_blank" rel="noreferrer">
              <svg className="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="home__fade" aria-hidden="true"></div>
    </section>
  )
}