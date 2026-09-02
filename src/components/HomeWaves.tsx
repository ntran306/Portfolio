import { useEffect, useRef } from 'react'
import type { BallState } from './HomeBall'

/**
 * Wave divider at the Home → About seam.
 *
 * A 1D spring-mass water surface: each sample point is pulled back to rest and
 * drags its neighbours, so a disturbance ripples outward and settles. Layers
 * drift on their own via travelling sines, and the physics ball splashes into
 * the surface when it drops low enough.
 *
 * Shares the ball's canvas geometry (both fill the whole Home section), so ball
 * coordinates need no conversion.
 */

const N = 140       // sample points across the width
const K = 0.022     // spring constant pulling a point back to rest
const DAMP = 0.958  // per-frame velocity damping
const SPREAD = 0.16 // how strongly a point drags its neighbours
const PASSES = 2    // neighbour-propagation passes per frame
const MAX_H = 40    // displacement clamp, so the surface can't thrash

// Ball coupling. Deliberately conservative: the ball can travel up to MAXV
// (34) px per frame, so an unclamped impulse swamps a surface whose
// displacement is measured in single pixels.
const ENTRY_MARGIN = 8   // px the ball's underside must cross the rest line by
const REACH = 1.1        // horizontal influence, in ball radii
const MAX_DY = 18        // clamp on the per-frame ball travel feeding a splash
const DROP_GAIN = 0.14   // how much of that travel becomes surface velocity
const DEPTH_GAIN = 0.012 // steady push from the submerged volume
const MAX_PUSH = 3.5     // per-point velocity injection cap

interface Layer {
  off: number    // vertical offset from the rest line
  amp: number    // travelling-sine amplitude
  freq: number   // travelling-sine frequency
  speed: number  // drift speed (negative = drifts the other way)
  sim: number    // how much of the ball-driven simulation this layer picks up
  width: number
  alpha: number
}
const LAYERS: Layer[] = [
  { off: -24, amp: 7, freq: 0.010, speed: 0.35, sim: 0.35, width: 1.2, alpha: 0.28 },
  { off: 16, amp: 5, freq: 0.016, speed: -0.50, sim: 0.50, width: 1.5, alpha: 0.45 },
  { off: 0, amp: 9, freq: 0.008, speed: 0.55, sim: 1.00, width: 2.0, alpha: 0.80 },
]

export default function HomeWaves({ ballRef }: { ballRef: React.RefObject<BallState> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, band = 150, t = 0, raf = 0, running = false
    const hgt = new Float32Array(N)
    const vel = new Float32Array(N)
    const lD = new Float32Array(N)
    const rD = new Float32Array(N)
    let prevY = 0
    let hasPrev = false

    // Rest line sits inside the wave band near the bottom of the section, so the
    // ball (which bounces off the section floor) actually breaks the surface.
    const restY = () => h - band * 0.42

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      w = canvas.clientWidth || 1
      h = canvas.clientHeight || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      band = Math.max(110, Math.min(180, h * 0.16))
    }

    const simulate = () => {
      for (let i = 0; i < N; i++) {
        vel[i] = (vel[i] - K * hgt[i]) * DAMP
        hgt[i] += vel[i]
        // Hard ceiling on displacement; bleed the velocity so a clamped point
        // doesn't keep pressing against the limit.
        if (hgt[i] > MAX_H) { hgt[i] = MAX_H; vel[i] *= 0.5 }
        else if (hgt[i] < -MAX_H) { hgt[i] = -MAX_H; vel[i] *= 0.5 }
      }
      for (let p = 0; p < PASSES; p++) {
        for (let i = 0; i < N; i++) {
          lD[i] = SPREAD * (hgt[i] - hgt[i > 0 ? i - 1 : i])
          rD[i] = SPREAD * (hgt[i] - hgt[i < N - 1 ? i + 1 : i])
        }
        for (let i = 0; i < N; i++) {
          if (i > 0) vel[i - 1] += lD[i]
          if (i < N - 1) vel[i + 1] += rD[i]
        }
      }
    }

    // Ball → water. Uses the ball's actual per-frame movement rather than its
    // stored velocity so a dragged ball splashes too, and keeps pushing while
    // submerged so it carves a trough instead of pinging once on entry.
    // Nothing happens until the ball's underside actually crosses the rest
    // line — gating on the horizontal reach instead would start the splash
    // while the ball was still a couple of hundred px above the water.
    const disturb = () => {
      const b = ballRef.current
      if (!b || !b.ready || w <= 0) return
      if (!hasPrev) { prevY = b.y; hasPrev = true; return }
      const dy = b.y - prevY
      prevY = b.y

      const surface = restY()
      const bottom = b.y + b.r
      if (bottom < surface - ENTRY_MARGIN) return // still above the water line

      const reach = b.r * REACH
      const drop = Math.max(-MAX_DY, Math.min(MAX_DY, dy))
      const step = w / (N - 1)
      for (let i = 0; i < N; i++) {
        const d = Math.abs(i * step - b.x)
        if (d > reach) continue
        const f = 1 - d / reach
        const ff = f * f
        const depth = Math.max(0, bottom - (surface + hgt[i]))
        const push = (drop * DROP_GAIN + depth * DEPTH_GAIN) * ff
        vel[i] += Math.max(-MAX_PUSH, Math.min(MAX_PUSH, push))
      }
    }

    const draw = () => {
      if (w <= 0 || h <= 0) return
      ctx.clearRect(0, 0, w, h)
      const surface = restY()
      // Fades out at both edges so the waves don't collide with the viewport sides.
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, 'rgba(127,220,255,0)')
      grad.addColorStop(0.5, 'rgba(106,166,255,1)')
      grad.addColorStop(1, 'rgba(127,220,255,0)')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = grad
      const step = w / (N - 1)
      for (const L of LAYERS) {
        ctx.beginPath()
        for (let i = 0; i < N; i++) {
          const x = i * step
          const y = surface + L.off
            + Math.sin(x * L.freq + t * L.speed) * L.amp
            + hgt[i] * L.sim
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.globalAlpha = L.alpha
        ctx.lineWidth = L.width
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const frame = () => {
      if (canvas.clientWidth !== w || canvas.clientHeight !== h) setSize()
      t += 0.016
      disturb()
      simulate()
      draw()
    }

    const loop = () => { frame(); raf = requestAnimationFrame(loop) }
    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop) } }
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 }

    setSize()
    draw()
    if (reduce) return // static surface, no animation

    const ro = new ResizeObserver(setSize)
    ro.observe(canvas)
    // Only run while the hero is on screen.
    const io = new IntersectionObserver(
      (es) => { if (es[0].isIntersecting) start(); else stop() },
      { threshold: 0.02 },
    )
    io.observe(canvas)
    const onVis = () => { if (document.hidden) stop(); else start() }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ballRef])

  return <canvas ref={canvasRef} className="home__waves" aria-hidden="true" />
}
