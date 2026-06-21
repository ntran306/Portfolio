import { useEffect, useRef } from 'react'

// Placeholder interactive 3D object: a wireframe icosahedron that auto-rotates
// and can be dragged to spin. Swap this component out for a real model later
// (e.g. a Three.js / Spline scene) — the Contact layout already reserves the slot.

const PHI = (1 + Math.sqrt(5)) / 2
const MAG = Math.hypot(1, PHI)
const VERTS: [number, number, number][] = ([
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
] as [number, number, number][]).map(([x, y, z]) => [x / MAG, y / MAG, z / MAG] as [number, number, number])

// Edges = vertex pairs one edge-length apart.
const EDGES: [number, number][] = (() => {
  const out: [number, number][] = []
  const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  const target = 4 / (MAG * MAG)
  for (let i = 0; i < VERTS.length; i++)
    for (let j = i + 1; j < VERTS.length; j++)
      if (Math.abs(d2(VERTS[i], VERTS[j]) - target) < 0.02) out.push([i, j])
  return out
})()

export default function Object3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rot = useRef({ x: -0.35, y: 0, vx: 0, vy: 0 })
  const drag = useRef({ active: false, lx: 0, ly: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    let R = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      w = rect.width || 300
      h = rect.height || 300
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = Math.min(w, h) * 0.4
    }

    const render = () => {
      if (!drag.current.active) {
        rot.current.y += 0.005 + rot.current.vy
        rot.current.x += rot.current.vx
        rot.current.vx *= 0.95
        rot.current.vy *= 0.95
      }
      const { x: rx, y: ry } = rot.current
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry)
      const pts = VERTS.map(([x, y, z]) => {
        let X = x * cy - z * sy
        let Z = x * sy + z * cy
        const Y = y * cx - Z * sx
        Z = y * sx + Z * cx
        const p = 1 / (1.6 - Z * 0.5) // perspective: nearer (larger Z) → bigger
        return { x: w / 2 + X * R * p, y: h / 2 + Y * R * p, z: Z }
      })

      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = 1.4
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(106,166,255,.55)'
      ctx.shadowBlur = 7
      for (const [a, b] of EDGES) {
        const pa = pts[a]
        const pb = pts[b]
        const depth = (pa.z + pb.z) / 2
        ctx.strokeStyle = `rgba(127,220,255,${(0.22 + ((depth + 1) / 2) * 0.6).toFixed(2)})`
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.stroke()
      }
      ctx.shadowBlur = 0
      for (const p of pts) {
        ctx.fillStyle = `rgba(220,238,255,${(0.35 + ((p.z + 1) / 2) * 0.55).toFixed(2)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => { render(); raf = requestAnimationFrame(loop) }

    resize()
    render() // paint once synchronously
    const ro = new ResizeObserver(() => { resize(); render() })
    ro.observe(canvas)
    raf = requestAnimationFrame(loop)

    const onDown = (e: PointerEvent) => {
      drag.current = { active: true, lx: e.clientX, ly: e.clientY }
      try { canvas.setPointerCapture(e.pointerId) } catch { /* synthetic */ }
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.lx
      const dy = e.clientY - drag.current.ly
      rot.current.y += dx * 0.01
      rot.current.x += dy * 0.01
      rot.current.vy = dx * 0.0016
      rot.current.vx = dy * 0.0016
      drag.current.lx = e.clientX
      drag.current.ly = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      drag.current.active = false
      try { canvas.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div className="contact-obj">
      <canvas ref={canvasRef} className="contact-obj__canvas" aria-label="Interactive 3D object placeholder — drag to rotate" />
      <span className="contact-obj__hint">drag to rotate</span>
    </div>
  )
}
