import { useEffect, useRef } from 'react'

const NAME = 'NATHAN'
const NAME_LETTERS = NAME.split('')
const ROWS = 3
const WORDS_PER_ROW = 2

const FONT_H = 64
const EXT = 24      // extrusion depth in steps (px)
const EX = 1.15     // per-step x offset → isometric lean (right, steeper angle)
const EY = 0.85     // per-step y offset → depth (down)

const CW = 124
const CH = 150
const BASELINE = CH - EXT - 14  // glyph face baseline inside the sprite

const MOUSE_R = 90    // proximity falloff radius (px) — tighter so fewer letters react
const MOUSE_LIFT = 34 // max lift from cursor (px)
const EASE = 0.18
const REST_EPS = 0.15   // below this, treat a cell as settled
const ACTIVE_EPS = 0.10 // proximity above which a letter flashes (higher → tighter color reach)

// Hover "flash": a bright band sweeps backward through the extrusion depth,
// re-lighting the stacked 3D layers from the front face toward the deep end.
const NPHASE = 6         // sweep frames cached per (letter, palette)
const FLASH_PERIOD = 0.8 // seconds for one front→back sweep
const LIT_WIDTH = 5      // extrusion steps the bright band spans
const LIT_AMT = 0.8      // how far the lit band is pushed toward white (0..1)

// Each palette: a bright top "face" plus a body ramp (light→dark) that
// becomes the horizontal depth bands down the side of the extrusion.
interface Palette { face: string; body: string[] }
const PALETTES: Palette[] = [
  { face: '#bcd4ff', body: ['#7fb0ff', '#5d90ec', '#3f6fd0', '#2a54b4', '#1b3d92', '#102a6e'] },
  { face: '#c8f0ff', body: ['#84e0ff', '#4fc4f4', '#28a6e0', '#1186c4', '#0a66a0', '#064a7a'] },
  { face: '#d8e6ff', body: ['#9cc0ff', '#6f98f4', '#4f78e8', '#3358d4', '#2440ad', '#172d84'] },
  { face: '#c4f2ff', body: ['#7fe2ff', '#46c8f4', '#22ace4', '#1289c8', '#0a6aa2', '#054d78'] },
]

// Module-level cache: one sprite per (letter, palette, litStep) — cells share them.
const spriteCache = new Map<string, HTMLCanvasElement>()

// Lighten a hex color toward white by `amt` (0..1).
function brighten(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const m = (c: number) => Math.round(c + (255 - c) * amt)
  return `rgb(${m(r)},${m(g)},${m(b)})`
}

// litStep < 0 → plain sprite. Otherwise the extrusion band nearest `litStep`
// (0 = front face, EXT = deepest) is brightened, producing one frame of the
// backward-propagating flash.
function renderSprite(letter: string, pal: Palette, litStep: number): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = CW
  out.height = CH
  const ctx = out.getContext('2d')!

  // 1. Glyph silhouette mask.
  const mask = document.createElement('canvas')
  mask.width = CW
  mask.height = CH
  const mctx = mask.getContext('2d')!
  mctx.font = `900 ${FONT_H}px Impact,"Arial Black",sans-serif`
  mctx.textAlign = 'center'
  mctx.textBaseline = 'alphabetic'
  mctx.fillStyle = '#fff'
  const cx = CW / 2 - (EXT * EX) / 2
  mctx.fillText(letter, cx, BASELINE)

  // 2. Reusable scratch canvas for color-stamping the mask.
  const tmp = document.createElement('canvas')
  tmp.width = CW
  tmp.height = CH
  const tctx = tmp.getContext('2d')!
  const stamp = (hex: string, ox: number, oy: number) => {
    tctx.globalCompositeOperation = 'source-over'
    tctx.clearRect(0, 0, CW, CH)
    tctx.fillStyle = hex
    tctx.fillRect(0, 0, CW, CH)
    tctx.globalCompositeOperation = 'destination-in'
    tctx.drawImage(mask, 0, 0)
    ctx.drawImage(tmp, ox, oy)
  }

  // 3. Extrude: stamp the silhouette from deepest → nearest so closer
  //    copies occlude farther ones, building a solid banded 3D body.
  for (let i = EXT; i >= 1; i--) {
    const t = i / EXT // 1 = deep, →0 = near the face
    const bi = Math.min(pal.body.length - 1, Math.floor(t * pal.body.length))
    let color = pal.body[bi]
    if (litStep >= 0) {
      const d = Math.abs(i - litStep)
      if (d < LIT_WIDTH) color = brighten(color, LIT_AMT * (1 - d / LIT_WIDTH))
    }
    stamp(color, i * EX, i * EY)
  }
  // 4. Bright front face on top (also lit when the band reaches the front).
  let face = pal.face
  if (litStep >= 0 && litStep < LIT_WIDTH) face = brighten(face, LIT_AMT * (1 - litStep / LIT_WIDTH))
  stamp(face, 0, 0)

  return out
}

function getSprite(letter: string, palIdx: number, litStep = -1): HTMLCanvasElement {
  const key = `${letter}|${palIdx}|${litStep}`
  let s = spriteCache.get(key)
  if (!s) {
    s = renderSprite(letter, PALETTES[palIdx], litStep)
    spriteCache.set(key, s)
  }
  return s
}

interface Cell {
  el: HTMLCanvasElement
  cx: number
  cy: number
  lift: number
  glow: number
  letter: string
  palIdx: number
  litStep: number // currently-drawn flash frame (-1 = plain sprite)
}

interface CellMeta { letter: string; palIdx: number; delay: number }

export default function IsometricGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const canvasEls = useRef<(HTMLCanvasElement | null)[]>([])

  // Tile NAME across ROWS × REPS; assign palette + a staggered idle phase.
  const layout: CellMeta[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let word = 0; word < WORDS_PER_ROW; word++) {
      for (let letterIdx = 0; letterIdx < NAME_LETTERS.length; letterIdx++) {
        const col = word * NAME_LETTERS.length + letterIdx
        layout.push({
          letter: NAME_LETTERS[letterIdx],
          palIdx: (row + col) % PALETTES.length,
          delay: col * 0.16 + row * 0.32,
        })
      }
    }
  }

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    // Paint each 3D letter once (static). Lift/glow are applied later as
    // cheap CSS transforms/filters — the canvas is never redrawn per frame.
    const cells: Cell[] = []
    layout.forEach((m, i) => {
      const el = canvasEls.current[i]
      if (!el) return
      const sprite = getSprite(m.letter, m.palIdx)
      el.getContext('2d')!.drawImage(sprite, 0, 0)
      cells.push({ el, cx: 0, cy: 0, lift: 0, glow: 0, letter: m.letter, palIdx: m.palIdx, litStep: -1 })
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const measure = () => {
      for (const c of cells) {
        c.cx = c.el.offsetLeft + CW / 2
        c.cy = c.el.offsetTop + CH / 2
      }
    }
    measure()

    const mouse = { x: -9999, y: -9999, active: false }
    let raf = 0

    const loop = () => {
      const now = performance.now() / 1000
      let active = false
      for (const c of cells) {
        let tLift = 0
        let tGlow = 0
        if (mouse.active) {
          const dx = mouse.x - c.cx
          const dy = mouse.y - c.cy
          const m = Math.exp(-(dx * dx + dy * dy) / (2 * MOUSE_R * MOUSE_R))
          tLift = m * MOUSE_LIFT
          tGlow = m
        }
        c.lift += (tLift - c.lift) * EASE
        c.glow += (tGlow - c.glow) * EASE

        const ctx = c.el.getContext('2d')!
        if (c.glow > ACTIVE_EPS) {
          // A bright band sweeps front→back through the extrusion (the flash),
          // re-drawn only when it advances to a new depth step.
          const ph = Math.floor(((now / FLASH_PERIOD) % 1) * NPHASE) % NPHASE
          const litStep = Math.round((ph / (NPHASE - 1)) * EXT)
          if (litStep !== c.litStep) {
            c.litStep = litStep
            ctx.clearRect(0, 0, CW, CH)
            ctx.drawImage(getSprite(c.letter, c.palIdx, litStep), 0, 0)
          }
          // Darker at the edge of reach → brighter toward the cursor.
          c.el.style.transform = `translateY(${-c.lift.toFixed(2)}px)`
          c.el.style.filter = `brightness(${(0.9 + c.glow * 0.35).toFixed(3)})`
          active = true
        } else {
          if (c.litStep !== -1) {
            c.litStep = -1
            ctx.clearRect(0, 0, CW, CH)
            ctx.drawImage(getSprite(c.letter, c.palIdx), 0, 0)
          }
          if (c.lift > REST_EPS) {
            c.el.style.transform = `translateY(${-c.lift.toFixed(2)}px)`
            c.el.style.filter = ''
            active = true
          } else if (c.lift !== 0 || c.el.style.transform || c.el.style.filter) {
            c.lift = 0
            c.glow = 0
            c.el.style.transform = ''
            c.el.style.filter = ''
          }
        }
      }
      raf = active ? requestAnimationFrame(loop) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }

    const onMove = (e: MouseEvent) => {
      const gr = grid.getBoundingClientRect()
      mouse.x = e.clientX - gr.left
      mouse.y = e.clientY - gr.top
      mouse.active = true
      kick()
    }
    const onLeave = () => { mouse.active = false; kick() }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', measure)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let idx = 0
  return (
    <div
      ref={gridRef}
      aria-hidden="true"
      className="iso-grid"
    >
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} className="iso-row">
          {Array.from({ length: WORDS_PER_ROW }, (_, word) => (
            <div key={word} className="iso-word">
              {NAME_LETTERS.map(() => {
                const i = idx++
                const delay = layout[i].delay
                return (
                  <canvas
                    key={i}
                    ref={(el) => { canvasEls.current[i] = el }}
                    className="iso-cell"
                    width={CW}
                    height={CH}
                    style={{ animationDelay: `${-delay}s` }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
