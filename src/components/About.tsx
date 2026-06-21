import { useRef } from 'react'
import { about } from '../content'

const PHOTOS = [1, 2, 3]
const BOUNCE = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease'

export default function About() {
  const tiles = useRef<(HTMLDivElement | null)[]>([])

  // Reverse accordion: photos collapse on mouse leave with staggered wave.
  const applyCollapse = () => {
    tiles.current.forEach((el, i) => {
      if (!el) return
      el.style.transition = BOUNCE
      el.style.transitionDelay = `${i * 70}ms`
      el.style.transform = `perspective(800px) rotate(45deg) translateY(0px) scale(1)`
      el.style.boxShadow = `0 12px 40px rgba(0,0,0,.3)`
      el.style.zIndex = '1'
    })
  }

  // Hovering one tile lifts it and ripples outward.
  const applyWave = (active: number) => {
    tiles.current.forEach((el, i) => {
      if (!el) return
      const dist = Math.abs(i - active)
      const lift = -Math.max(3, 18 - dist * 7)
      const scale = Math.max(1, 1.1 - dist * 0.035)
      const glow = Math.max(0, 0.5 - dist * 0.16)
      el.style.transition = BOUNCE
      el.style.transitionDelay = `${dist * 70}ms`
      el.style.transform = `perspective(800px) rotate(45deg) translateY(${lift}px) scale(${scale.toFixed(3)})`
      el.style.boxShadow = `0 ${Math.round(-lift + 10)}px ${Math.round(-lift * 2 + 26)}px rgba(106,166,255,${glow.toFixed(2)})`
      el.style.zIndex = dist === 0 ? '10' : '1'
    })
  }

  // The directly-hovered tile additionally tilts in 3D toward the cursor.
  const tiltActive = (e: React.MouseEvent, active: number) => {
    const el = tiles.current[active]
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    const T = 18
    el.style.transition = 'transform 0.12s ease-out, box-shadow 0.2s ease'
    el.style.transitionDelay = '0ms'
    el.style.transform =
      `perspective(800px) rotateX(${(-py * T).toFixed(2)}deg) rotateY(${(px * T).toFixed(2)}deg) rotate(45deg) translateY(-18px) scale(1.1)`
  }

  const reset = applyCollapse

  return (
    <section id="about" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>{about.heading}</h2>
          <p>{about.subhead}</p>
        </div>

        <div className="about-photos reveal" onMouseLeave={reset}>
          {PHOTOS.map((n, i) => (
            <div
              key={n}
              ref={(el) => { tiles.current[i] = el }}
              className={`photo-diamond photo-diamond--${n}`}
              onMouseEnter={() => applyWave(i)}
              onMouseMove={(e) => tiltActive(e, i)}
            >
              <div className="photo-diamond__placeholder">Photo {n}</div>
            </div>
          ))}
        </div>

        <div className="panel reveal">
          <p>{about.bio}</p>
        </div>
      </div>
    </section>
  )
}
