import { useEffect, useRef } from 'react'

export default function Home() {
  const bg3dRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const homeSectionRef = useRef<HTMLElement>(null)

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

  // Wave canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const homeSection = homeSectionRef.current
    if (!canvas || !homeSection) return

    let ctx: CanvasRenderingContext2D
    let W: number, H: number
    let mouseX: number | null = null
    let mouseInfluence = 0
    let mouseNormX = 0.5
    let time = 0
    let raf: number

    const layers = [
      { speed: 0.4, amp: 38, freq: 0.012, phase: 0, alpha: 0.55, width: 1.5 },
      { speed: 0.25, amp: 22, freq: 0.018, phase: 2.1, alpha: 0.30, width: 1.0 },
      { speed: 0.55, amp: 14, freq: 0.008, phase: 4.4, alpha: 0.18, width: 0.8 },
    ]

    const setup = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = homeSection.getBoundingClientRect()
      W = rect.width; H = rect.height
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = homeSection.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      mouseNormX = mouseX / W
      mouseInfluence = Math.max(0, 1 - Math.abs((mouseY / H) - 0.5) * 1.6)
    }

    const onMouseLeave = () => { mouseX = null; mouseInfluence = 0 }

    const drawLayer = (layer: typeof layers[0], midY: number) => {
      const points: {x: number, y: number}[] = []
      for (let x = 0; x <= W; x += 3) {
        const normX = x / W
        let y = Math.sin(x * layer.freq + time * layer.speed + layer.phase) * layer.amp
        y += Math.sin(x * layer.freq * 2.3 + time * layer.speed * 1.4 + layer.phase) * layer.amp * 0.35
        if (mouseX !== null && mouseInfluence > 0) {
          const dx = normX - mouseNormX
          const bell = Math.exp(-(dx * dx) / 0.06)
          y += Math.sign(y || 1) * bell * mouseInfluence * layer.amp * 2.2
        }
        points.push({ x, y })
      }

      ctx.beginPath()
      ctx.moveTo(points[0].x, midY + points[0].y)
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i+1].x) / 2
        const my = midY + (points[i].y + points[i+1].y) / 2
        ctx.quadraticCurveTo(points[i].x, midY + points[i].y, mx, my)
      }
      ctx.lineTo(points[points.length-1].x, midY + points[points.length-1].y)
      for (let i = points.length - 1; i >= 1; i--) {
        const mx = (points[i].x + points[i-1].x) / 2
        const my = midY + (-points[i].y + -points[i-1].y) / 2
        ctx.quadraticCurveTo(points[i].x, midY + -points[i].y, mx, my)
      }
      ctx.lineTo(points[0].x, midY + -points[0].y)
      ctx.closePath()

      const grad = ctx.createLinearGradient(0, midY - layer.amp * 3, 0, midY + layer.amp * 3)
      grad.addColorStop(0, `rgba(127,220,255,0)`)
      grad.addColorStop(0.3, `rgba(106,166,255,${layer.alpha * 0.4})`)
      grad.addColorStop(0.5, `rgba(106,166,255,${layer.alpha})`)
      grad.addColorStop(0.7, `rgba(106,166,255,${layer.alpha * 0.4})`)
      grad.addColorStop(1, `rgba(127,220,255,0)`)
      ctx.fillStyle = grad; ctx.fill()

      const strokeGrad = ctx.createLinearGradient(0, 0, W, 0)
      strokeGrad.addColorStop(0, 'rgba(127,220,255,0.0)')
      strokeGrad.addColorStop(0.1, `rgba(127,220,255,${layer.alpha * 1.4})`)
      strokeGrad.addColorStop(0.5, `rgba(127,220,255,${layer.alpha * 1.8})`)
      strokeGrad.addColorStop(0.9, `rgba(127,220,255,${layer.alpha * 1.4})`)
      strokeGrad.addColorStop(1, 'rgba(127,220,255,0.0)')

      ctx.beginPath()
      ctx.moveTo(points[0].x, midY + points[0].y)
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i+1].x) / 2
        const my = midY + (points[i].y + points[i+1].y) / 2
        ctx.quadraticCurveTo(points[i].x, midY + points[i].y, mx, my)
      }
      ctx.lineTo(points[points.length-1].x, midY + points[points.length-1].y)
      ctx.strokeStyle = strokeGrad; ctx.lineWidth = layer.width; ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(points[0].x, midY - points[0].y)
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i+1].x) / 2
        const my = midY - (points[i].y + points[i+1].y) / 2
        ctx.quadraticCurveTo(points[i].x, midY - points[i].y, mx, my)
      }
      ctx.lineTo(points[points.length-1].x, midY - points[points.length-1].y)
      ctx.strokeStyle = strokeGrad; ctx.lineWidth = layer.width; ctx.stroke()
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const midY = H * 0.5
      for (let i = layers.length - 1; i >= 0; i--) drawLayer(layers[i], midY)
      time += 0.016
      raf = requestAnimationFrame(draw)
    }

    setup()
    draw()
    homeSection.addEventListener('mousemove', onMouseMove, { passive: true })
    homeSection.addEventListener('mouseleave', onMouseLeave, { passive: true })
    window.addEventListener('resize', setup)

    return () => {
      cancelAnimationFrame(raf)
      homeSection.removeEventListener('mousemove', onMouseMove)
      homeSection.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', setup)
    }
  }, [])

  return (
    <section id="home" className="home home--full" ref={homeSectionRef}>
      <div className="home__bg" aria-hidden="true">
        <div className="bg-3d" ref={bg3dRef}>
          <div className="bg-3d__layer bg-3d__layer--a"></div>
          <div className="bg-3d__layer bg-3d__layer--b"></div>
          <div className="bg-3d__layer bg-3d__layer--c"></div>
          <div className="bg-3d__shine"></div>
        </div>
      </div>

      <canvas className="wave-canvas" ref={canvasRef}></canvas>

      <div className="home__content wrap">
        <div className="home__card reveal">
          <div className="motion-box" id="tiltCard">
            <div className="glass">
              <div className="glass__content">
                <h1>Hi, I'm <span className="accent">Nathan Tran</span>.</h1>
                <p className="sub">Developer passionate about creating interactive experiences through games, web, and XR.</p>
              </div>
            </div>
          </div>
          <div className="hero__buttons">
            <a className="btn btn--primary" href="#projects">See Projects</a>
            <a className="btn" href="assets/resume.pdf" target="_blank" rel="noreferrer">Resume</a>
            <a className="btn" href="https://github.com/ntran306" target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn" href="https://www.linkedin.com/in/ntran306/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="home__fade"></div>
    </section>
  )
}