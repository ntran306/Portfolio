import { useEffect, useRef, useState } from 'react'
import { projects, type ProjectCategory } from '../content'

const GAP = 16 // half-gap (degrees) on each side of a cardinal
const PAD = 12 // viewBox padding around the ring

// A minimalist line-circle drawn as 4 arcs, leaving a gap at each square.
function makeArcs(R: number): string[] {
  const C = R + PAD
  const polar = (deg: number): [number, number] => {
    const a = (deg * Math.PI) / 180
    return [C + R * Math.cos(a), C + R * Math.sin(a)]
  }
  const arc = (a0: number, a1: number) => {
    const [x0, y0] = polar(a0)
    const [x1, y1] = polar(a1)
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
  }
  return [
    arc(0 + GAP, 90 - GAP),
    arc(90 + GAP, 180 - GAP),
    arc(180 + GAP, 270 - GAP),
    arc(270 + GAP, 360 - GAP),
  ]
}

/* ---------- Detail view: a left semicircle dial; a right panel shows the
   focused project. Scrolling (or clicking a diamond) rotates the whole
   constellation so the active project glides along the arc to its apex. ---------- */
const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

function ProjectsOrbit({ category, onClose }: { category: ProjectCategory; onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const N = category.projects.length
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const [dir, setDir] = useState(1) // last step direction — slides the detail panel to match
  const [geom, setGeom] = useState({ w: 0, h: 0, cx: 0, cy: 0, Rd: 0 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      setGeom({
        w, h,
        cx: Math.min(w * 0.13, 100),
        cy: h / 2,
        Rd: Math.max(110, Math.min(h * 0.4, 150)),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    // Scroll on the arc side steps through projects; the right panel side — and
    // scrolling past either end — falls through to normal page scroll, so the
    // orbit never traps the page. Deltas accumulate so a wheel notch or trackpad
    // flick is one clean step, and a short cooldown keeps a single gesture from
    // skipping through several projects mid-glide.
    let acc = 0
    let coolUntil = 0
    const onWheel = (e: WheelEvent) => {
      const detail = el.querySelector('.proj-orbit__detail') as HTMLElement | null
      if (detail && e.clientX >= detail.getBoundingClientRect().left) return
      const d = e.deltaY > 0 ? 1 : -1
      const next = activeRef.current + d
      if (next < 0 || next >= N) return // at the ends: let the page scroll
      e.preventDefault()
      const now = performance.now()
      if (now < coolUntil) return
      if ((acc > 0) !== (e.deltaY > 0)) acc = 0 // direction flip resets the gesture
      acc += e.deltaY
      if (Math.abs(acc) < 60) return
      acc = 0
      coolUntil = now + 350
      activeRef.current = next
      setDir(d)
      setActive(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => { ro.disconnect(); el.removeEventListener('wheel', onWheel) }
  }, [N])

  const project = category.projects[active] ?? category.projects[0]
  const { w, h, cx, cy, Rd } = geom

  // The constellation rotates with `active`: the active project sits at the
  // arc's apex (0°) and neighbors fan out by STEP°, clamped just inside the
  // semicircle's ends so far-away markers bunch at the poles instead of
  // leaving the arc. CSS transitions on left/top make each step glide.
  const STEP = Math.min(55, 160 / Math.max(1, N - 1))
  const posOf = (i: number) => {
    const a = (Math.max(-82, Math.min(82, (i - active) * STEP)) * Math.PI) / 180
    return { x: cx + Rd * Math.cos(a), y: cy + Rd * Math.sin(a) }
  }

  return (
    <div className="proj-orbit" ref={wrapRef} role="dialog" aria-label={category.name}>
      {Rd > 0 && (
        <svg className="proj-orbit__arc" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
          <path className="proj-orbit__arcline" d={`M${cx},${cy - Rd} A${Rd},${Rd} 0 0 1 ${cx},${cy + Rd}`} />
        </svg>
      )}

      {/* Center label — click to return to the category wheel. */}
      <button className="proj-orbit__center" onClick={onClose}>
        <span className="proj-orbit__title">{category.name}</span>
        <span className="proj-orbit__back">← back</span>
      </button>

      {/* Diamond markers — one per project, gliding along the arc as `active` moves. */}
      {Rd > 0 && category.projects.map((p, i) => {
        const pos = posOf(i)
        return (
          <button
            key={p.title}
            className={`proj-orbit__diamond${i === active ? ' is-active' : ''}`}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => { setDir(i > activeRef.current ? 1 : -1); activeRef.current = i; setActive(i) }}
            aria-label={p.title}
            title={p.title}
          />
        )
      })}

      {N > 1 && <div className="proj-orbit__scroll-hint" aria-hidden="true">scroll ↑↓</div>}

      {/* Detail + media; re-keyed to replay the entrance, sliding from the
          direction of travel. */}
      <div className="proj-orbit__detail" key={active} style={{ '--slide': `${dir * 18}px` } as React.CSSProperties}>
        <div className="proj-orbit__detail-body">
          <h3 className="proj-orbit__name">{project.title}</h3>
          <p className="proj-orbit__text">{project.text}</p>
          <div className="tags">{project.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          <a className="btn btn--primary proj-orbit__cta" href={project.href} target="_blank" rel="noreferrer">
            View project →
          </a>
        </div>
        <div className="proj-orbit__media">
          {project.media ? (
            isVideo(project.media)
              ? <video src={project.media} autoPlay loop muted playsInline />
              : <img src={project.media} alt={project.title} loading="lazy" />
          ) : (
            <div className="proj-orbit__media-ph" aria-hidden="true">
              <span>▶</span>
              <span className="proj-orbit__media-ph-label">image / gif / video</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const cats = projects.categories.slice(0, 4)
  const [selected, setSelected] = useState<number | null>(null)
  const [R, setR] = useState(150) // ring radius — shrinks to fit narrow screens

  const wheelRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const rot = useRef(0)
  const drag = useRef({ active: false, lastAngle: 0, vel: 0 })
  const rafRef = useRef(0)
  const selectedRef = useRef<number | null>(null)
  selectedRef.current = selected
  const lastScrollYRef = useRef(0)
  const scrollDirRef = useRef(1)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollDirRef.current = currentScrollY > lastScrollYRef.current ? 1 : -1
      lastScrollYRef.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const el = wheelRef.current
    if (!el) return
    const update = () => setR(Math.round(Math.max(96, Math.min(150, el.clientWidth / 2 - 56))))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 4 categories → North, East, South, West.
  const cardinals = [
    { x: 0, y: -R }, { x: R, y: 0 }, { x: 0, y: R }, { x: -R, y: 0 },
  ]
  const DIRS = ['n', 'e', 's', 'w']
  const arcs = makeArcs(R)
  const viewBox = 2 * (R + PAD)

  const applyRot = () => {
    if (ringRef.current) ringRef.current.style.transform = `rotate(${rot.current}deg)`
    nodeRefs.current.forEach((el) => {
      if (el) el.style.transform = `translate(-50%,-50%) rotate(${-rot.current}deg)`
    })
  }

  const centerAngle = (x: number, y: number) => {
    const r = ringRef.current!.getBoundingClientRect()
    return Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * (180 / Math.PI)
  }

  const stopMomentum = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0 } }

  const onDown = (e: React.PointerEvent) => {
    if (selected !== null) return
    stopMomentum()
    drag.current = { active: true, lastAngle: centerAngle(e.clientX, e.clientY), vel: 0 }
    try { ringRef.current!.setPointerCapture(e.pointerId) } catch { /* synthetic pointer */ }
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const ang = centerAngle(e.clientX, e.clientY)
    let d = ang - drag.current.lastAngle
    if (d > 180) d -= 360
    if (d < -180) d += 360
    rot.current += d
    drag.current.vel = d
    drag.current.lastAngle = ang
    applyRot()
  }
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    try { ringRef.current!.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    const spin = () => {
      rot.current += drag.current.vel
      drag.current.vel *= 0.985
      applyRot()
      rafRef.current = Math.abs(drag.current.vel) > 0.02 ? requestAnimationFrame(spin) : 0
    }
    if (Math.abs(drag.current.vel) > 0.02) rafRef.current = requestAnimationFrame(spin)
  }

  useEffect(() => () => stopMomentum(), [])

  // Intro spin: a quick decaying spin each time the wheel scrolls into view, to
  // hint that it's draggable. Replays on every re-entry.
  useEffect(() => {
    const el = wheelRef.current
    if (!el) return
    let wasIn = false
    const io = new IntersectionObserver((es) => {
      const isIn = es[0].isIntersecting
      if (isIn && !wasIn && selectedRef.current === null) {
        stopMomentum()
        let v = 12 * scrollDirRef.current
        const spin = () => {
          rot.current += v
          v *= 0.972
          applyRot()
          rafRef.current = Math.abs(v) > 0.1 ? requestAnimationFrame(spin) : 0
        }
        rafRef.current = requestAnimationFrame(spin)
      }
      wasIn = isIn
    }, { threshold: 0.45 })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (i: number) => { stopMomentum(); setSelected((prev) => (prev === i ? null : i)) }

  return (
    <section id="projects" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>{projects.heading}</h2>
          <p>{projects.subhead}</p>
        </div>

        <div className="proj-stage reveal">
          <div className={`proj-wheel ${selected !== null ? 'is-open' : ''}`} ref={wheelRef}>
            <div
              className="proj-ring"
              ref={ringRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              <svg
                className="proj-ring__svg"
                viewBox={`0 0 ${viewBox} ${viewBox}`}
                style={{ width: viewBox, height: viewBox }}
                aria-hidden="true"
              >
                {arcs.map((d, i) => <path key={i} d={d} className="proj-arc" />)}
              </svg>
              {cats.map((cat, i) => (
                <div
                  key={cat.name}
                  className={`proj-node proj-node--${DIRS[i]}`}
                  ref={(el) => { nodeRefs.current[i] = el }}
                  style={{ left: `calc(50% + ${cardinals[i].x}px)`, top: `calc(50% + ${cardinals[i].y}px)` }}
                >
                  <button
                    className="proj-node__square"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => pick(i)}
                    aria-label={cat.name}
                  />
                  <span className="proj-node__label">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {selected !== null && (
            <ProjectsOrbit key={selected} category={cats[selected]} onClose={() => setSelected(null)} />
          )}
        </div>
      </div>
    </section>
  )
}
