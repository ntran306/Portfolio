import { useRef } from 'react'

const categories = [
  {
    name: 'Videogame Development',
    projects: [
      { title: 'Game Project One', pill: 'Unity', text: "One-line: what you built + what's cool about it.", tags: ['C#', 'Unity'], href: '#' },
    ],
  },
  {
    name: 'Web Development',
    projects: [
      { title: 'Web Project One', pill: 'Live', text: 'One-line: product outcome / users / impact.', tags: ['React', 'Node'], href: '#' },
    ],
  },
  {
    name: 'XR / VR Development',
    projects: [
      { title: 'XR Project', pill: 'Quest', text: 'One-line: interaction/tech highlight.', tags: ['Unity', 'XR'], href: '#' },
    ],
  },
  {
    name: 'Miscellaneous Development',
    projects: [
      { title: 'Misc Project', pill: 'Tool', text: 'One-line: why it exists and who it helps.', tags: ['Python', 'CLI'], href: '#' },
    ],
  },
]

function ProjectCard({ p }: { p: typeof categories[0]['projects'][0] }) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const handleMouseEnter = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'translateY(-6px) scale(1.02)'
    el.style.boxShadow = '0 16px 48px rgba(106,166,255,.35), 0 0 0 1px rgba(106,166,255,.25)'
    el.style.borderColor = 'rgba(106,166,255,.4)'
    el.style.background = 'rgba(106,166,255,.06)'
  }

  const handleMouseLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
    el.style.borderColor = ''
    el.style.background = ''
  }

  return (
    <a
      ref={cardRef}
      className="card card--link project-item"
      href={p.href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card__top">
        <div className="card__title">{p.title}</div>
        <div className="pill">{p.pill}</div>
      </div>
      <p className="card__text">{p.text}</p>
      <div className="tags">
        {p.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
    </a>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>Projects</h2>
          <p>Expand a category to explore.</p>
        </div>

        <div className="accordions reveal">
          {categories.map((cat) => (
            <details key={cat.name} className="acc">
              <summary className="acc__sum">
                <span>{cat.name}</span>
                <div className="acc__bubble"></div>
              </summary>
              <div className="acc__body">
                <div className="grid">
                  {cat.projects.map((p) => <ProjectCard key={p.title} p={p} />)}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}