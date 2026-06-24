import { useEffect, useRef } from 'react'

// Wireframe icosahedron (same style as the Contact 3D object) used as a
// physics ball: it bounces off the home box walls, can be grabbed + thrown,
// reacts to the window being resized, and shatters/rebuilds at size extremes.

const PHI = (1 + Math.sqrt(5)) / 2
const MAG = Math.hypot(1, PHI)
const VERTS: [number, number, number][] = ([
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
] as [number, number, number][]).map(([x, y, z]) => [x / MAG, y / MAG, z / MAG] as [number, number, number])

const EDGES: [number, number][] = (() => {
  const out: [number, number][] = []
  const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  const t = 4 / (MAG * MAG)
  for (let i = 0; i < VERTS.length; i++)
    for (let j = i + 1; j < VERTS.length; j++)
      if (Math.abs(d2(VERTS[i], VERTS[j]) - t) < 0.02) out.push([i, j])
  return out
})()

// Per-edge shatter params: a scattered direction jitter, a spin, a distance.
const FRAG = EDGES.map(() => ({
  spin: (Math.random() - 0.5) * 3.2,
  dist: 70 + Math.random() * 140,
  jit: (Math.random() - 0.5) * 0.9,
}))

const REST = 0.95       // wall restitution (keeps momentum)
const FRICTION = 0.999  // very light drag
const MAXV = 34         // throw speed cap
const SH_SMALL = 250    // shatter when the box min-dimension drops below this
const SH_BIG = 320      // rebuild once it grows back above this (hysteresis)

export default function HomeBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const grabbable = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    canvas.style.pointerEvents = grabbable ? 'auto' : 'none'

    let raf = 0
    let running = false
    let started = false
    let w = 0
    let h = 0
    let pulse = 0
    const b = { x: 0, y: 0, vx: 0, vy: 0, r: 0, rotX: -0.35, rotY: 0 }
    const drag = { active: false, ox: 0, oy: 0, vx: 0, vy: 0 }
    const sh = { v: 0, target: 0 } // shatter 0 = whole, 1 = fully shattered
    const flashes: { x: number; y: number; life: number; maxR: number }[] = []
    const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = []

    // Wall impact: a water-droplet ripple localized at the contact point + a few
    // particles. The ripple's size scales strongly with impact speed; it fires
    // even at normal speed (just smaller). (nx, ny) is the inward wall normal.
    const impact = (x: number, y: number, nx: number, ny: number, speed: number) => {
      if (speed < 0.5) return
      const s = Math.min(1, speed / 14)
      flashes.push({ x, y, life: 1, maxR: 55 + s * 175 })
      const n = 3 + Math.floor(s * 5)
      for (let i = 0; i < n; i++) {
        const t = (Math.random() - 0.5) * 1.5 // tangential spread along the wall
        const sp = (1.2 + Math.random() * 2.8) * (0.6 + s)
        parts.push({ x, y, vx: nx * sp - ny * t, vy: ny * sp + nx * t, life: 1 })
      }
      if (parts.length > 70) parts.splice(0, parts.length - 70)
    }

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      const nw = canvas.clientWidth || 1
      const nh = canvas.clientHeight || 1
      // A wall that moves inward (shrink) imparts momentum to the ball.
      if (started) {
        if (nw < w && b.x + b.r > nw) b.vx += (nw - w) * 1.1
        if (nh < h && b.y + b.r > nh) b.vy += (nh - h) * 1.1
      }
      w = nw; h = nh
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      b.r = Math.max(48, Math.min(170, Math.min(w, h) * 0.18))
      // Only place the ball once the box has a real size.
      if (!started && nw > 40 && nh > 40) { b.x = w * 0.5; b.y = h * 0.42; b.vx = 2.6; b.vy = 1.7; started = true }
      const m = Math.min(w, h)
      sh.target = m < SH_SMALL ? 1 : m > SH_BIG ? 0 : sh.target
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h)
      if (!started || sh.v > 0.995) return
      const er = b.r * (1 + pulse * 0.13)
      const cosX = Math.cos(b.rotX), sinX = Math.sin(b.rotX)
      const cosY = Math.cos(b.rotY), sinY = Math.sin(b.rotY)
      const pts = VERTS.map(([x, y, z]) => {
        let X = x * cosY - z * sinY
        let Z = x * sinY + z * cosY
        const Y = y * cosX - Z * sinX
        Z = y * sinX + Z * cosX
        const p = 1 / (1.7 - Z * 0.45)
        return { x: b.x + X * er * p, y: b.y + Y * er * p, z: Z }
      })
      const fade = 1 - sh.v
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = `rgba(106,166,255,${(0.45 + pulse * 0.45).toFixed(2)})`
      ctx.shadowBlur = 8 + pulse * 16
      EDGES.forEach(([a, c], i) => {
        let pa = pts[a]
        let pb = pts[c]
        if (sh.v > 0.001) {
          const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2
          const ang = Math.atan2(my - b.y, mx - b.x) + FRAG[i].jit
          const off = sh.v * FRAG[i].dist
          const ox = Math.cos(ang) * off, oy = Math.sin(ang) * off
          const sp = sh.v * FRAG[i].spin
          const cs = Math.cos(sp), sn = Math.sin(sp)
          const rot = (px: number, py: number) => ({ x: mx + (px - mx) * cs - (py - my) * sn, y: my + (px - mx) * sn + (py - my) * cs })
          const ra = rot(pa.x, pa.y), rb = rot(pb.x, pb.y)
          pa = { x: ra.x + ox, y: ra.y + oy, z: pa.z }
          pb = { x: rb.x + ox, y: rb.y + oy, z: pb.z }
        }
        const depth = (pts[a].z + pts[c].z) / 2
        ctx.strokeStyle = `rgba(127,220,255,${(fade * (0.22 + ((depth + 1) / 2) * 0.6)).toFixed(2)})`
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.stroke()
      })
      ctx.shadowBlur = 0
      if (sh.v < 0.4) {
        const va = Math.max(0, 1 - sh.v * 2.5)
        for (const p of pts) {
          ctx.fillStyle = `rgba(220,238,255,${(va * (0.4 + ((p.z + 1) / 2) * 0.5)).toFixed(2)})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2.3 * (1 + pulse * 0.13), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // wall-impact: a water-droplet ripple localized at the contact point — an
      // expanding ring (size scaled by impact speed) + a quick bright core.
      for (const f of flashes) {
        const rad = 4 + (1 - f.life) * f.maxR
        ctx.strokeStyle = `rgba(170,232,255,${(0.5 * f.life).toFixed(2)})`
        ctx.lineWidth = 2.6 * f.life + 0.5
        ctx.beginPath()
        ctx.arc(f.x, f.y, rad, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = `rgba(205,240,255,${(0.5 * f.life * f.life).toFixed(2)})`
        ctx.beginPath()
        ctx.arc(f.x, f.y, 3 * f.life, 0, Math.PI * 2)
        ctx.fill()
      }
      // impact particles
      for (const p of parts) {
        ctx.fillStyle = `rgba(190,235,255,${p.life.toFixed(2)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.7 * p.life + 0.7, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = () => {
      // Self-correct the backing store if the box changed size (also drives the
      // wall-hit momentum), independent of ResizeObserver timing.
      if (canvas.clientWidth !== w || canvas.clientHeight !== h) setSize()
      if (!started) { render(); return }
      const prev = sh.v
      sh.v += (sh.target - sh.v) * 0.1
      if (sh.v < 0.02 && prev > 0.06 && sh.target === 0) pulse = 1 // rebuilt → glow + pulse
      if (sh.v < 0.9) {
        if (!drag.active) {
          b.x += b.vx; b.y += b.vy
          b.vx *= FRICTION; b.vy *= FRICTION
          if (b.x < b.r) { const s = Math.abs(b.vx); b.x = b.r; b.vx = s * REST; impact(0, b.y, 1, 0, s) }
          else if (b.x > w - b.r) { const s = Math.abs(b.vx); b.x = w - b.r; b.vx = -s * REST; impact(w, b.y, -1, 0, s) }
          if (b.y < b.r) { const s = Math.abs(b.vy); b.y = b.r; b.vy = s * REST; impact(b.x, 0, 0, 1, s) }
          else if (b.y > h - b.r) { const s = Math.abs(b.vy); b.y = h - b.r; b.vy = -s * REST; impact(b.x, h, 0, -1, s) }
          if (Math.hypot(b.vx, b.vy) < 0.25) { b.vx += (Math.random() - 0.5) * 0.25; b.vy += (Math.random() - 0.5) * 0.25 }
        }
        b.rotY += b.vx * 0.004 + 0.0035
        b.rotX += b.vy * 0.004
      }
      // decay impact flashes + particles
      for (let i = flashes.length - 1; i >= 0; i--) { flashes[i].life -= 0.02; if (flashes[i].life <= 0) flashes.splice(i, 1) }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy *= 0.9; p.life -= 0.035
        if (p.life <= 0) parts.splice(i, 1)
      }
      pulse *= 0.93
      render()
    }

    const loop = () => { step(); raf = requestAnimationFrame(loop) }
    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop) } }
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }

    setSize()
    render()
    const ro = new ResizeObserver(() => setSize())
    ro.observe(canvas)

    // Pause off-screen; pulse a soft "hello" when scrolled back into view.
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { if (sh.v < 0.1) pulse = Math.max(pulse, 0.8); start() }
      else stop()
    }, { threshold: 0.05 })
    io.observe(canvas)

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onDown = (e: PointerEvent) => {
      if (sh.v > 0.4) return
      const { x, y } = toLocal(e)
      if (Math.hypot(x - b.x, y - b.y) > b.r * 1.3) return
      drag.active = true
      drag.ox = b.x - x; drag.oy = b.y - y; drag.vx = 0; drag.vy = 0
      b.vx = 0; b.vy = 0
      try { canvas.setPointerCapture(e.pointerId) } catch { /* synthetic */ }
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.active) return
      const { x, y } = toLocal(e)
      const nx = Math.max(b.r, Math.min(w - b.r, x + drag.ox))
      const ny = Math.max(b.r, Math.min(h - b.r, y + drag.oy))
      drag.vx = nx - b.x; drag.vy = ny - b.y
      b.x = nx; b.y = ny
    }
    const onUp = (e: PointerEvent) => {
      if (!drag.active) return
      drag.active = false
      const cap = (v: number) => Math.max(-MAXV, Math.min(MAXV, v))
      b.vx = cap(drag.vx); b.vy = cap(drag.vy)
      try { canvas.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    }
    if (grabbable) {
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)
    }

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return <canvas ref={canvasRef} className="home-ball" aria-hidden="true" />
}
