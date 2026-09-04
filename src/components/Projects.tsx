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

/* ---------- Detail view: a left dial the projects orbit; a right panel shows
   the focused project. Projects sit evenly spaced (360/N°) around the circle;
   wheel and drag rotate the dial continuously — the diamonds ride the circle
   1:1 with your input — then it softlocks to the nearest project. ---------- */
const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

function ProjectsOrbit({ category, onClose }: { category: ProjectCategory; onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const dialRef = useRef<HTMLDivElement>(null)
  const diamondRefs = useRef<(HTMLButtonElement | null)[]>([])
  const N = category.projects.length
  const STEP = 360 / N // even spacing — project i rides at rot + i*STEP degrees
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1) // last travel direction — slides the detail panel to match
  const [geom, setGeom] = useState({ w: 0, h: 0, cx: 0, cy: 0, Rd: 0 })
  const geomRef = useRef(geom)

  // Continuous rotation: `rot` is what's painted, easing toward `target`.
  // The project nearest the apex (0°, due right of the dial center) is active.
  const rot = useRef(0)
  const target = useRef(0)
  const activeIdx = useRef(0)
  const dragDist = useRef(0) // px moved since pointerdown — tells a drag from a click
  // Drag entry point shared with the diamonds' onPointerDown (they mount after
  // the effect runs, so they can't be wired up with addEventListener there).
  const dragStartRef = useRef<((e: PointerEvent, capEl: Element) => void) | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    const dial = dialRef.current
    if (!el || !dial) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const g = {
        w, h,
        cx: Math.min(w * 0.13, 100),
        cy: h / 2,
        Rd: Math.max(110, Math.min(h * 0.4, 150)),
      }
      geomRef.current = g
      setGeom(g)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    // Half-up rounding that treats negatives the same as positives —
    // Math.round(-0.5) is -0 while Math.round(0.5) is 1, and that asymmetry
    // would make the detent snap disagree with the active index right at the
    // halfway point between two projects.
    const roundHalf = (x: number) => Math.floor(x + 0.5)
    const detent = (r: number) => roundHalf(r / STEP) * STEP
    const idxOf = (r: number) => ((-roundHalf(r / STEP) % N) + N) % N
    // Keep the detail panel in sync mid-rotation, not just at rest.
    const syncActive = (r: number, d: 1 | -1) => {
      const idx = idxOf(r)
      if (idx === activeIdx.current) return
      activeIdx.current = idx
      setDir(d)
      setActive(idx)
    }

    // Paint loop: ease rot toward target and lay the diamonds out on the
    // circle every frame — bright at the apex, receding toward the back.
    let raf = 0
    let lastRot = 0
    const frame = () => {
      const { cx, cy, Rd } = geomRef.current
      const r = rot.current + (target.current - rot.current) * (reduce ? 1 : 0.16)
      rot.current = Math.abs(target.current - r) < 0.01 ? target.current : r

      diamondRefs.current.forEach((dEl, i) => {
        if (!dEl) return
        const a = ((rot.current + i * STEP) * Math.PI) / 180
        dEl.style.left = `${cx + Rd * Math.cos(a)}px`
        dEl.style.top = `${cy + Rd * Math.sin(a)}px`
        const closeness = 0.5 + 0.5 * Math.cos(a) // 1 at apex → 0 at the back
        dEl.style.opacity = (0.2 + 0.8 * closeness).toFixed(3)
      })

      if (rot.current !== lastRot) syncActive(rot.current, rot.current < lastRot ? 1 : -1)
      lastRot = rot.current
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    // Wheel spins the dial continuously (never the page), softlocking to the
    // nearest project once the gesture goes idle.
    const K = STEP / 160 // deg per wheel-delta unit — one notch comfortably clears a project
    let idle = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      target.current -= e.deltaY * K
      syncActive(target.current, e.deltaY > 0 ? 1 : -1)
      window.clearTimeout(idle)
      idle = window.setTimeout(() => { target.current = detent(target.current) }, 140)
    }
    dial.addEventListener('wheel', onWheel, { passive: false })

    // Drag spins the dial in a circle, 1:1 under the pointer (no easing lag
    // while grabbing), and settles to the nearest project on release. Drags
    // can start on the dial surface OR on a diamond — same feel either way;
    // a small movement threshold keeps plain diamond clicks working.
    let dragging = false
    let lastAngle = 0
    let startX = 0
    let startY = 0
    const angleAt = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      const { cx, cy } = geomRef.current
      return (Math.atan2(e.clientY - (b.top + cy), e.clientX - (b.left + cx)) * 180) / Math.PI
    }
    const startDrag = (e: PointerEvent, capEl: Element) => {
      dragging = true
      lastAngle = angleAt(e)
      startX = e.clientX
      startY = e.clientY
      dragDist.current = 0
      window.clearTimeout(idle)
      // capture on whatever was grabbed (dial or diamond), so the diamond's
      // click still fires at the diamond when it wasn't really a drag
      try { capEl.setPointerCapture(e.pointerId) } catch { /* synthetic pointer */ }
    }
    dragStartRef.current = startDrag
    const onDialDown = (e: PointerEvent) => startDrag(e, dial)
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      dragDist.current = Math.max(dragDist.current, Math.hypot(e.clientX - startX, e.clientY - startY))
      const a = angleAt(e)
      let d = a - lastAngle
      if (d > 180) d -= 360
      if (d < -180) d += 360
      lastAngle = a
      rot.current += d
      target.current = rot.current
      syncActive(rot.current, d < 0 ? 1 : -1)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      target.current = detent(target.current)
      // let the trailing click (which fires right after pointerup) read the
      // drag distance before it resets
      window.setTimeout(() => { dragDist.current = 0 }, 0)
    }
    dial.addEventListener('pointerdown', onDialDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(idle)
      ro.disconnect()
      dragStartRef.current = null
      dial.removeEventListener('wheel', onWheel)
      dial.removeEventListener('pointerdown', onDialDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [N, STEP])

  const project = category.projects[active] ?? category.projects[0]
  const { w, h, cx, cy, Rd } = geom

  // Clicking a diamond spins it to the apex by the shortest path. A grab that
  // actually dragged the dial suppresses the trailing click.
  const spinTo = (i: number) => {
    if (dragDist.current > 6) return
    const base = -i * STEP
    target.current = base + 360 * Math.round((target.current - base) / 360)
    setDir(i > activeIdx.current ? 1 : -1)
    activeIdx.current = i
    setActive(i)
  }

  // Initial layout for the first paint; the rAF loop takes over immediately.
  const posOf = (i: number) => {
    const a = (i * STEP * Math.PI) / 180
    return { x: cx + Rd * Math.cos(a), y: cy + Rd * Math.sin(a) }
  }

  return (
    <div className="proj-orbit" ref={wrapRef} role="dialog" aria-label={category.name}>
      {/* Grab/scroll surface for the dial half — wheel and drag land here (and
          only here), so dial input never leaks into page scroll. Sits under
          the diamonds and center button, which stay clickable. */}
      <div className="proj-orbit__dial" ref={dialRef} aria-hidden="true" />

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

      {/* Diamond markers — one per project, riding the dial as it spins. */}
      {Rd > 0 && category.projects.map((p, i) => {
        const pos = posOf(i)
        return (
          <button
            key={p.title}
            ref={(el) => { diamondRefs.current[i] = el }}
            className={`proj-orbit__diamond${i === active ? ' is-active' : ''}`}
            style={{ left: pos.x, top: pos.y }}
            onPointerDown={(e) => dragStartRef.current?.(e.nativeEvent, e.currentTarget)}
            onClick={() => spinTo(i)}
            aria-label={p.title}
            title={p.title}
          />
        )
      })}

      {N > 1 && (
        <div className="proj-orbit__scroll-hint" aria-hidden="true">
          <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="8" y="2.5" width="8" height="13" rx="4"/><line x1="12" y1="6" x2="12" y2="9"/><path d="M9 19.5l3 3 3-3"/></svg>
          {' · '}
          <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="9 19 12 22 15 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
        </div>
      )}

      {/* Detail + media; re-keyed to replay the entrance, sliding from the
          direction of travel. */}
      <div className="proj-orbit__detail" key={active} style={{ '--slide': `${dir * 18}px` } as React.CSSProperties}>
        <div className="proj-orbit__detail-body">
          <h3 className="proj-orbit__name">{project.title}</h3>
          <p className="proj-orbit__text">{project.text}</p>
          <div className="tags">{project.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          {/* Hidden entirely when there's nothing public to link, rather than
              rendering a button that goes nowhere. */}
          {project.href && (
            <a className="btn btn--primary proj-orbit__cta" href={project.href} target="_blank" rel="noreferrer">
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View project
            </a>
          )}
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
