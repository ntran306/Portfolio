import { useRef } from 'react'

const skills = [
  { k: 'Languages', v: 'Python • Java • C/C++ • JS/TS • C#' },
  { k: 'Frameworks', v: 'React • Node • Flask • Next.js • Express' },
  { k: 'Engines', v: 'Unity • Unreal Engine' },
  { k: 'Tools', v: 'Git • Docker • Blender • Twilio • AWS' },
  { k: 'Specialized', v: 'Machine Learning • XR/VR • Game Dev • Web3' },
]

export default function Skills() {
  const lockRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = (idx: number, allEls: HTMLElement[]) => {
    if (lockRef.current) return
    allEls.forEach((el, i) => {
      const dist = Math.abs(i - idx)
      setTimeout(() => {
        if (i === idx) {
          el.style.transform = 'translateY(-8px) scale(1.02)'
          el.style.boxShadow = '0 8px 30px rgba(106,166,255,.3)'
          el.style.background = 'rgba(106,166,255,.08)'
          el.style.borderColor = 'rgba(106,166,255,.3)'
        } else {
          el.style.transform = 'translateY(-4px) scale(1.01)'
          el.style.boxShadow = '0 6px 20px rgba(106,166,255,.2)'
        }
        setTimeout(() => {
          el.style.transform = ''
          el.style.boxShadow = ''
          el.style.background = ''
          el.style.borderColor = ''
        }, 500)
      }, dist * 120)
    })
    const maxDist = Math.max(...allEls.map((_, i) => Math.abs(i - idx)))
    lockRef.current = setTimeout(() => { lockRef.current = null }, maxDist * 120 + 1000)
  }

  return (
    <section id="skills" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>Skills</h2>
          <p>Technologies I work with.</p>
        </div>
        <div className="skills-list reveal">
          {skills.map((s, idx) => (
            <div
              key={s.k}
              className="skill-row"
              onMouseEnter={(e) => {
                const parent = e.currentTarget.parentElement
                if (!parent) return
                const all = Array.from(parent.querySelectorAll('.skill-row')) as HTMLElement[]
                handleMouseEnter(idx, all)
              }}
            >
              <span className="skill-row__k">{s.k}</span>
              <span className="skill-row__v">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}