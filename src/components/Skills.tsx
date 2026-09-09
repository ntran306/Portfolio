import { useEffect, useRef, useState } from 'react'
import { skills } from '../content'

const chipsOf = (v: string) => v.split('•').map((t) => t.trim()).filter(Boolean)

/* Per-skill icons: devicon logos where one exists, emoji for concepts.
   Keyed by the chip text in content.ts — add a new entry when adding a skill. */
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons'
const SKILL_ICONS: Record<string, string> = {
  // Languages
  'Java': `${DEVICON}/java/java-original.svg`,
  'Python': `${DEVICON}/python/python-original.svg`,
  'C': `${DEVICON}/c/c-original.svg`,
  'C#': `${DEVICON}/csharp/csharp-original.svg`,
  'JavaScript': `${DEVICON}/javascript/javascript-original.svg`,
  'SQL': '🗄️',
  'Lua': `${DEVICON}/lua/lua-original.svg`,
  'Assembly': '⚙️',
  'HTML/CSS': `${DEVICON}/html5/html5-original.svg`,
  // Frameworks
  'Django': `${DEVICON}/django/django-plain.svg`,
  'FastAPI': `${DEVICON}/fastapi/fastapi-original.svg`,
  'React': `${DEVICON}/react/react-original.svg`,
  'Unity': `${DEVICON}/unity/unity-original.svg`,
  'Unreal Engine': `${DEVICON}/unrealengine/unrealengine-original.svg`,
  // Libraries
  'MediaPipe': '✋',
  'OpenCV': `${DEVICON}/opencv/opencv-original.svg`,
  'NumPy': `${DEVICON}/numpy/numpy-original.svg`,
  'pygame': '🎮',
  'moderngl': '🔺',
  'JAX': '🧮',
  'Flax': '🕸️',
  'HuggingFace': '🤗',
  // Tools
  // Devicon only ships wide *wordmark* variants for AWS, which are illegible in
  // a 14px chip, so this one stays an emoji.
  'AWS': '☁️',
  'Terraform': `${DEVICON}/terraform/terraform-original.svg`,
  'Docker': `${DEVICON}/docker/docker-original.svg`,
  'Git': `${DEVICON}/git/git-original.svg`,
  'GitHub': `${DEVICON}/github/github-original.svg`,
  'PostgreSQL': `${DEVICON}/postgresql/postgresql-original.svg`,
  'MySQL': `${DEVICON}/mysql/mysql-original.svg`,
  'Twilio': '💬',
  'Blender': `${DEVICON}/blender/blender-original.svg`,
  // Concepts
  'Full-Stack': '🧱',
  'Backend': '🗃️',
  'Frontend': '🖥️',
  'REST APIs': '🔌',
  'CI/CD': '🔁',
  'Automation': '🤖',
  'Agile/Scrum': '🏃',
  'DevOps': '♾️',
}
/* White/dark logos need inverting to stay visible on the dark theme. */
const INVERT_ICONS = new Set(['Unreal Engine', 'Django', 'Unity', 'GitHub'])

/* Icons for the section branches themselves (Languages, Frameworks, …). */
const SECTION_ICONS: Record<string, string> = {
  'Languages': '⌨️',
  'Frameworks & Engines': '🧩',
  'Libraries': '📚',
  'Tools': '🛠️',
  'Concepts': '🧠',
}

function ChipIcon({ label }: { label: string }) {
  const icon = SKILL_ICONS[label]
  if (!icon) return null
  if (icon.startsWith('http')) {
    return (
      <img
        className={`sk-chip__icon${INVERT_ICONS.has(label) ? ' sk-chip__icon--invert' : ''}`}
        src={icon}
        alt=""
        loading="lazy"
      />
    )
  }
  return <span className="sk-chip__emoji" aria-hidden="true">{icon}</span>
}

export default function Skills() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const branchRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [paths, setPaths] = useState<string[]>([])
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [isIn, setIsIn] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  // Measure the branch links from the "Skills" root out to each section.
  useEffect(() => {
    const wrap = wrapRef.current
    const root = rootRef.current
    if (!wrap || !root) return
    const draw = () => {
      const wb = wrap.getBoundingClientRect()
      const rb = root.getBoundingClientRect()
      const x0 = rb.right - wb.left
      const y0 = rb.top + rb.height / 2 - wb.top
      const ds = branchRefs.current.map((el) => {
        if (!el) return ''
        const bb = el.getBoundingClientRect()
        const x1 = bb.left - wb.left
        const y1 = bb.top + bb.height / 2 - wb.top
        const mx = x0 + (x1 - x0) * 0.5
        return `M${x0.toFixed(1)},${y0.toFixed(1)} C${mx.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`
      })
      setBox({ w: wb.width, h: wb.height })
      setPaths(ds)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(wrap)
    window.addEventListener('resize', draw)
    return () => { ro.disconnect(); window.removeEventListener('resize', draw) }
  }, [])

  // Replay the entrance choreography every time the section re-enters view.
  // Hysteresis: play once ≥35% is visible, reset only once it's essentially
  // gone (≤2%) so the reset happens off-screen, not while partially visible.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.intersectionRatio >= 0.35) setIsIn(true)
        else if (e.intersectionRatio <= 0.15) { setIsIn(false); setSelected(null) }
      }),
      { threshold: [0, 0.15, 0.35] },
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  const toggle = (i: number) => setSelected((prev) => (prev === i ? null : i))

  return (
    <section id="skills" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>{skills.heading}</h2>
          <p>{skills.subhead}</p>
        </div>

        <div
          className={`sk-tree${isIn ? ' is-in' : ''}${selected !== null ? ' has-sel' : ''}`}
          ref={wrapRef}
        >
          {/* Phase 1 — a transparent diamond traced by two lines, then it fades */}
          <svg className="sk-diamond" viewBox="0 0 100 100" aria-hidden="true">
            <path className="sk-diamond__line" pathLength={1} d="M50,6 L6,50 L50,94" />
            <path className="sk-diamond__line" pathLength={1} d="M50,6 L94,50 L50,94" />
          </svg>

          {/* Phase 2 — branch links draw in */}
          <svg
            className="sk-links"
            width={box.w}
            height={box.h}
            viewBox={`0 0 ${box.w} ${box.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {paths.map((d, i) => (d ? <path key={i} d={d} className="sk-link" pathLength={1} /> : null))}
          </svg>

          <div className="sk-root" ref={rootRef}>
            <span className="sk-root__dot" />
            <span className="sk-root__label">{skills.heading}</span>
          </div>

          <div className="sk-branches">
            {skills.items.map((s, i) => (
              <button
                type="button"
                className={`sk-branch${selected === i ? ' is-sel' : ''}`}
                key={s.k}
                ref={(el) => { branchRefs.current[i] = el }}
                style={{ '--i': i } as React.CSSProperties}
                onClick={() => toggle(i)}
                aria-expanded={selected === i}
              >
                <span className="sk-branch__head">
                  <span className="sk-branch__marker" />
                  {SECTION_ICONS[s.k] && (
                    <span className="sk-branch__icon" aria-hidden="true">{SECTION_ICONS[s.k]}</span>
                  )}
                  <span className="sk-branch__name">{s.k}</span>
                </span>
                {/* The wrapper collapses to zero height while unselected, so a
                    branch is only as tall as its name (see .sk-chips-wrap). */}
                <span className="sk-chips-wrap">
                  <span className="sk-chips">
                    {chipsOf(s.v).map((t, j) => (
                      <span className="sk-chip" key={t} style={{ '--j': j } as React.CSSProperties}>
                        <ChipIcon label={t} />
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
