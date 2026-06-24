import { useEffect, useRef, useState } from 'react'
import { experience } from '../content'

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const smooth = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t) }

const AMP0 = 16 // base wave amplitude (px)

// Layered parallax waves, drawn back → front. The last entry is the prominent
// "main" line that the timeline dots ride on; the rest add subtle depth.
interface WaveLayer {
  ampMul: number; freq: number; freq2: number; phase: number
  speed: number; speed2: number; yOff: number
  width: number; alpha: number; blur: number; bulgeMul: number
}
const LAYERS: WaveLayer[] = [
  { ampMul: 0.85, freq: 0.0072, freq2: 0.018,  phase: 3.4, speed: 0.30, speed2: 0.50, yOff: 46,  width: 1.0, alpha: 0.18, blur: 5,  bulgeMul: 0.5 },
  { ampMul: 0.55, freq: 0.016,  freq2: 0.030,  phase: 2.3, speed: 0.80, speed2: 1.05, yOff: -26, width: 1.2, alpha: 0.28, blur: 6,  bulgeMul: 0.6 },
  { ampMul: 0.70, freq: 0.009,  freq2: 0.020,  phase: 1.1, speed: 0.42, speed2: 0.60, yOff: 22,  width: 1.6, alpha: 0.45, blur: 8,  bulgeMul: 0.8 },
  { ampMul: 1.00, freq: 0.012,  freq2: 0.0264, phase: 0.0, speed: 0.60, speed2: 0.84, yOff: 0,   width: 2.4, alpha: 1.00, blur: 12, bulgeMul: 1.0 },
]
const MAIN = LAYERS[LAYERS.length - 1]

export default function Experience() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px), (prefers-reduced-motion: reduce)')
    const update = () => setCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return compact ? <ExperienceList /> : <ExperiencePinned />
}

/* ---------- Compact / reduced-motion fallback ---------- */
function ExperienceList() {
  return (
    <section id="experience" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>{experience.heading}</h2>
          <p>{experience.subhead}</p>
        </div>
        <div className="exp-list reveal">
          {experience.items.map((e, i) => (
            <article key={i} className="exp-card exp-card--static">
              <div className="exp-card__top">
                <span className="exp-card__title">{e.title}</span>
                <span className="pill">{e.year}</span>
              </div>
              <p className="exp-card__text">{e.text}</p>
              <div className="tags">{e.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Pinned scroll-driven horizontal timeline ---------- */
function ExperiencePinned() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!track || !stage || !canvas) return
    const ctx = canvas.getContext('2d')!
    const N = experience.items.length

    let SW = 0, SH = 0, midY = 0
    let raf = 0
    let smoothP = 0
    let time = 0
    let mouseX = -1
    let mouseInf = 0
    let mouseInfTarget = 0

    const focusOf = (i: number) => (i + 0.5) / N
    const WIN = 1 / N

    const setup = () => {
      const dpr = window.devicePixelRatio || 1
      SW = stage.clientWidth
      SH = stage.clientHeight
      midY = SH * 0.6
      canvas.width = Math.max(1, Math.round(SW * dpr))
      canvas.height = Math.max(1, Math.round(SH * dpr))
      canvas.style.width = SW + 'px'
      canvas.style.height = SH + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Centerline of the prominent (front) wave — shared by the wave draw and
    // the timeline dots so they stay glued to the same line.
    const mainWaveY = (x: number, amp: number) =>
      midY + MAIN.yOff
      + Math.sin(x * MAIN.freq + time * MAIN.speed + MAIN.phase) * amp
      + Math.sin(x * MAIN.freq2 + time * MAIN.speed2 + MAIN.phase) * amp * 0.3

    const drawWaveLayer = (layer: WaveLayer, baseXs: number[], proxs: number[]) => {
      const pts: { x: number; y: number }[] = []
      for (let x = 0; x <= SW; x += 4) {
        // Amplitude scaling (smooth) — no sign-flip term, so reactive stays clean.
        let bulge = 0
        for (let i = 0; i < N; i++) {
          const d = x - baseXs[i]
          bulge += proxs[i] * Math.exp(-(d * d) / (2 * 120 * 120)) * 1.4
        }
        if (mouseInf > 0.001 && mouseX >= 0) {
          const d = x - mouseX
          bulge += mouseInf * Math.exp(-(d * d) / (2 * 90 * 90)) * 0.9
        }
        const amp = AMP0 * layer.ampMul * (1 + bulge * layer.bulgeMul)
        const y = midY + layer.yOff
          + Math.sin(x * layer.freq + time * layer.speed + layer.phase) * amp
          + Math.sin(x * layer.freq2 + time * layer.speed2 + layer.phase) * amp * 0.3
        pts.push({ x, y })
      }

      const a = layer.alpha
      const grad = ctx.createLinearGradient(0, 0, SW, 0)
      grad.addColorStop(0, 'rgba(127,220,255,0)')
      grad.addColorStop(0.1, `rgba(127,220,255,${0.7 * a})`)
      grad.addColorStop(0.5, `rgba(106,166,255,${0.9 * a})`)
      grad.addColorStop(0.9, `rgba(127,220,255,${0.7 * a})`)
      grad.addColorStop(1, 'rgba(127,220,255,0)')

      // Cylindrical fill: create a closed path from the wave down to a baseline
      // to give the stroke a 3D tube appearance.
      const fillGrad = ctx.createLinearGradient(0, 0, 0, SH)
      fillGrad.addColorStop(0, `rgba(106,166,255,${0.08 * a})`)
      fillGrad.addColorStop(0.5, `rgba(127,220,255,${0.04 * a})`)
      fillGrad.addColorStop(1, 'rgba(106,166,255,0)')

      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      // Close the path by dropping down and back along the baseline
      ctx.lineTo(pts[pts.length - 1].x, SH)
      ctx.lineTo(pts[0].x, SH)
      ctx.closePath()
      ctx.fillStyle = fillGrad
      ctx.fill()

      // Draw the stroke on top
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
      ctx.strokeStyle = grad
      ctx.lineWidth = layer.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'rgba(106,166,255,.6)'
      ctx.shadowBlur = layer.blur
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    const drawWave = (baseXs: number[], proxs: number[]) => {
      ctx.clearRect(0, 0, SW, SH)
      for (const layer of LAYERS) drawWaveLayer(layer, baseXs, proxs)
    }

    const frame = () => {
      const rect = track.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const targetP = clamp(total > 0 ? -rect.top / total : 0, 0, 1)
      smoothP += (targetP - smoothP) * 0.12
      time += 0.016
      mouseInf += (mouseInfTarget - mouseInf) * 0.08

      const baseXs: number[] = []
      const proxs: number[] = []
      for (let i = 0; i < N; i++) {
        baseXs.push(SW * 0.5 + (focusOf(i) - smoothP) * SW * 1.7)
        proxs.push(clamp(1 - Math.abs(smoothP - focusOf(i)) / WIN, 0, 1))
      }

      drawWave(baseXs, proxs)

      for (let i = 0; i < N; i++) {
        const prox = smooth(proxs[i])
        const bx = baseXs[i]
        const waveY = mainWaveY(bx, AMP0)
        const spiralR = 12 * (1 - prox * 0.92)
        const theta = smoothP * N * Math.PI * 3 + time * 0.45 + i * 1.4

        const dot = dotRefs.current[i]
        if (dot) {
          const dx = bx + Math.cos(theta) * spiralR
          const dy = waveY + Math.sin(theta) * spiralR
          const s = 1 + prox * 0.35
          dot.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) translate(-50%,-50%) scale(${s.toFixed(3)})`
          dot.style.opacity = (0.35 + prox * 0.55).toFixed(3)
        }

        const card = cardRefs.current[i]
        if (card) {
          const cx = SW * 0.5 + (focusOf(i) - smoothP) * SW * 0.5
          const o = smooth(clamp(1 - Math.abs(smoothP - focusOf(i)) / (WIN * 0.9), 0, 1))
          card.style.transform = `translate(${cx.toFixed(1)}px,${(SH * 0.4).toFixed(1)}px) translate(-50%,-50%) scale(${(0.92 + o * 0.08).toFixed(3)})`
          card.style.opacity = o.toFixed(3)
          card.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
        }
      }

    }

    const loop = () => { frame(); raf = requestAnimationFrame(loop) }
    const startLoop = () => { if (!raf) raf = requestAnimationFrame(loop) }
    const stopLoop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

    const checkRun = () => {
      const r = track.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const near = r.bottom > -240 && r.top < vh + 240
      if (near) startLoop()
      else stopLoop()
    }

    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect()
      mouseX = e.clientX - r.left
      mouseInfTarget = 1
    }
    const onLeave = () => { mouseInfTarget = 0 }
    const onResize = () => { setup(); checkRun() }

    setup()
    frame() // paint one frame synchronously so cards/wave show even before the first rAF tick
    const ro = new ResizeObserver(() => { setup(); frame() })
    ro.observe(stage)
    window.addEventListener('scroll', checkRun, { passive: true })
    window.addEventListener('resize', onResize)
    stage.addEventListener('mousemove', onMove, { passive: true })
    stage.addEventListener('mouseleave', onLeave)
    checkRun()
    startLoop()

    return () => {
      stopLoop()
      ro.disconnect()
      window.removeEventListener('scroll', checkRun)
      window.removeEventListener('resize', onResize)
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const N = experience.items.length
  return (
    <section id="experience" className="section exp">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>{experience.heading}</h2>
          <p>{experience.scrollHint}</p>
        </div>
      </div>

      <div className="exp-track" ref={trackRef} style={{ height: `${N * 100 + 100}vh` }}>
        <div className="exp-stage" ref={stageRef}>
          <canvas className="exp-wave" ref={canvasRef} aria-hidden="true"></canvas>

          <div className="exp-cards">
            {experience.items.map((e, i) => (
              <div key={i} className="exp-card" ref={(el) => { cardRefs.current[i] = el }}>
                <div className="exp-card__top">
                  <span className="exp-card__title">{e.title}</span>
                  <span className="pill">{e.year}</span>
                </div>
                <p className="exp-card__text">{e.text}</p>
                <div className="tags">{e.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              </div>
            ))}
          </div>

          <div className="exp-dots" aria-hidden="true">
            {experience.items.map((_, i) => (
              <div key={i} className="exp-dot" ref={(el) => { dotRefs.current[i] = el }}></div>
            ))}
          </div>

          <div className="exp-hint" aria-hidden="true">scroll</div>
        </div>
      </div>
    </section>
  )
}
