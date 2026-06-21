import { useEffect, useRef } from 'react'
import IsometricGrid from './IsometricGrid'
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
          <div className="bg-3d__shine"></div>
        </div>
      </div>

      <IsometricGrid />

      <div className="home__content wrap">
        <div className="home__card reveal">
          <div className="motion-box" id="tiltCard">
            <div className="glass">
              <div className="glass__content">
                <h1>{hero.greeting} <span className="accent">{hero.name}</span>.</h1>
                <p className="sub">{hero.tagline}</p>
              </div>
            </div>
          </div>
          <div className="hero__buttons">
            <a className="btn btn--primary" href="#projects">See Projects</a>
            <a className="btn" href={links.resume} target="_blank" rel="noreferrer">Resume</a>
            <a className="btn" href={links.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="home__fade"></div>
    </section>
  )
}