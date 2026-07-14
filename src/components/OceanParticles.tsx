import { useEffect, useRef } from 'react'

interface P {
  x: number; y: number; baseR: number; vy: number
  swayA: number; swayF: number; swayP: number; alpha: number
}

/**
 * Ambient ocean background — slow-rising motes (bubbles / plankton) that are
 * larger toward the bottom of the viewport and shrink as they drift up, with a
 * gentle horizontal sway. Fixed behind all content; the transparent sections
 * let it glow through as you scroll. Pauses while the tab is hidden, and renders
 * a single static frame under reduced-motion.
 */
export default function OceanParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = 0, H = 0, dpr = 1, raf = 0, t = 0
    let particles: P[] = []
    let lastScrollY = window.scrollY
    // The Experience pinned timeline (desktop only) hijacks vertical scroll to
    // drive its horizontal motion; cached here so we can ignore parallax there.
    let expTrack: HTMLElement | null = null

    const count = () => Math.round(Math.min(70, Math.max(26, (W * H) / 26000)))

    // Depth: a mote's drawn radius grows toward the bottom (≈0.35× at top → 1.75×
    // at bottom) so it appears close when low and recedes as it rises.
    const sizeForY = (baseR: number, y: number) => baseR * (0.35 + (y / H) * 1.4)

    const make = (fromBottom = false, fromTop = false): P => ({
      x: Math.random() * W,
      y: fromTop ? -Math.random() * 60 : fromBottom ? H + Math.random() * 60 : Math.random() * H,
      baseR: 1 + Math.random() * 2.4,
      vy: 5 + Math.random() * 13,            // px/sec, upward
      swayA: 5 + Math.random() * 18,         // sway amplitude (px)
      swayF: 0.15 + Math.random() * 0.45,    // sway frequency
      swayP: Math.random() * Math.PI * 2,
      alpha: 0.1 + Math.random() * 0.22,
    })

    const setup = () => {
      dpr = window.devicePixelRatio || 1
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.max(1, Math.round(W * dpr))
      canvas.height = Math.max(1, Math.round(H * dpr))
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: count() }, () => make(false))
      // Re-find on (re)setup — Experience swaps between pinned/compact on resize.
      expTrack = document.querySelector('.exp-track')
    }

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, W, H)
      t += dt

      // Scroll-reactive parallax: the field lives in the portfolio's space, so
      // scrolling drags it. Scroll down → particles stream upward (and the
      // closer/bigger ones near the bottom move more). Clamped so jump-to-section
      // doesn't teleport the whole field.
      const sy = window.scrollY
      let scrollDelta = Math.max(-160, Math.min(160, sy - lastScrollY))
      lastScrollY = sy

      // While the Experience timeline is pinned, vertical scroll is being spent
      // on its horizontal motion — let the field just drift, ignoring the scroll.
      // (lastScrollY still tracks above, so there's no jump when we leave.)
      if (expTrack) {
        const r = expTrack.getBoundingClientRect()
        if (r.top <= 0 && r.bottom >= H) scrollDelta = 0
      }

      for (const p of particles) {
        const closeness = Math.max(0, Math.min(1, p.y / H)) // 0 top → 1 bottom (closer)
        p.y -= p.vy * dt                                    // base drift up
        p.y -= scrollDelta * (0.35 + closeness * 0.9)       // parallax with scroll
        const r = sizeForY(p.baseR, p.y)
        if (p.y + r < -6) { Object.assign(p, make(true)); continue }       // exited top → respawn bottom
        if (p.y - r > H + 6) { Object.assign(p, make(false, true)); continue } // exited bottom → respawn top
        const x = p.x + Math.sin(t * p.swayF + p.swayP) * p.swayA
        const grad = ctx.createRadialGradient(x, p.y, 0, x, p.y, r)
        grad.addColorStop(0, `rgba(127,220,255,${p.alpha})`)
        grad.addColorStop(0.6, `rgba(106,166,255,${p.alpha * 0.45})`)
        grad.addColorStop(1, 'rgba(106,166,255,0)')
        ctx.beginPath()
        ctx.arc(x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      draw(dt)
      raf = requestAnimationFrame(loop)
    }

    setup()
    if (reduce) { draw(0); return }  // one static frame, no animation

    const onResize = () => setup()
    const onVis = () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0 } }
      else if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) }
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)
    last = performance.now()
    raf = requestAnimationFrame(loop)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas className="ocean-particles" ref={canvasRef} aria-hidden="true" />
}
