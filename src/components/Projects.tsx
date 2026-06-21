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

/* ---------- Detail view: projects orbiting a left-anchored circle ---------- */
function ProjectsOrbit({ category, onClose }: { category: ProjectCategory; onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const arcRef = useRef<SVGPathElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const rotation = useRef(0)
  const drag = useRef({ active: false, lastA: 0, vel: 0 })
  const rafRef = useRef(0)
  const geom = useRef({ cx: 0, cy: 0, Rd: 0 })
  const N = category.projects.length

  const angleAt = (clientX: number, clientY: number) => {
    const r = wrapRef.current!.getBoundingClientRect()
    return Math.atan2(clientY - (r.top + geom.current.cy), clientX - (r.left + geom.current.cx))
  }

  // Place each card on the circle; the one nearest the right (front) is largest.
  const layout = () => {
    const { cx, cy, Rd } = geom.current
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i]
      if (!el) continue
      const a = rotation.current + (i / N) * Math.PI * 2
      const x = cx + Math.cos(a) * Rd
      const y = cy + Math.sin(a) * Rd
      const front = (Math.cos(a) + 1) / 2 // 1 at the right, 0 at the left (behind)
      const s = 0.55 + front * 0.45
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${s.toFixed(3)})`
      el.style.opacity = (0.06 + front * 0.94).toFixed(2)
      el.style.zIndex = String(Math.round(front * 100))
      el.style.pointerEvents = front > 0.72 ? 'auto' : 'none'
    }
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const cx = Math.min(w * 0.18, 200)
      const cy = h / 2
      const Rd = Math.max(140, Math.min(h * 0.48, w - cx - 100))
      geom.current = { cx, cy, Rd }
      if (svgRef.current) svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`)
      if (arcRef.current) arcRef.current.setAttribute('d', `M${cx},${cy - Rd} A${Rd},${Rd} 0 0 1 ${cx},${cy + Rd}`)
      layout()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    // Scroll over the orbit rotates it (non-passive so we can preventDefault).
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      rotation.current += e.deltaY * 0.0026
      layout()
    }
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      ro.disconnect()
      el.removeEventListener('wheel', onWheel)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N])

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.proj-orbit__center, a')) return
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }
    drag.current = { active: true, lastA: angleAt(e.clientX, e.clientY), vel: 0 }
    try { wrapRef.current!.setPointerCapture(e.pointerId) } catch { /* synthetic */ }
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const a = angleAt(e.clientX, e.clientY)
    let d = a - drag.current.lastA
    if (d > Math.PI) d -= Math.PI * 2
    if (d < -Math.PI) d += Math.PI * 2
    rotation.current += d
    drag.current.vel = d
    drag.current.lastA = a
    layout()
  }
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    try { wrapRef.current!.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    const spin = () => {
      rotation.current += drag.current.vel
      drag.current.vel *= 0.97
      layout()
      rafRef.current = Math.abs(drag.current.vel) > 0.0008 ? requestAnimationFrame(spin) : 0
    }
    if (Math.abs(drag.current.vel) > 0.0008) rafRef.current = requestAnimationFrame(spin)
  }

  return (
    <div
      className="proj-orbit"
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="dialog"
      aria-label={category.name}
    >
      <svg className="proj-orbit__arc" ref={svgRef} aria-hidden="true">
        <path ref={arcRef} className="proj-orbit__arcline" />
      </svg>

      <button className="proj-orbit__center" onClick={onClose}>
        <span className="proj-orbit__title">{category.name}</span>
        <span className="proj-orbit__back">← back</span>
      </button>

      {category.projects.map((p, i) => (
        <div className="proj-orbit__card" key={p.title} ref={(el) => { cardRefs.current[i] = el }}>
          <a className="proj-orbit__link" href={p.href} target="_blank" rel="noreferrer">
            <span className="pill">{p.pill}</span>
            <span className="proj-orbit__name">{p.title}</span>
            <span className="proj-orbit__text">{p.text}</span>
            <span className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</span>
          </a>
        </div>
      ))}
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
