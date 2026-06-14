const experiences = [
  {
    title: 'Company — Role',
    year: '2025',
    text: 'Impact line. Result. Metric if possible.',
    tags: ['Python', 'Cloud', 'Data'],
    stagger: 0,
  },
  {
    title: 'Research / Club — Title',
    year: '2024',
    text: 'What you built / led. Why it mattered.',
    tags: ['ML', 'Leadership'],
    stagger: 1,
  },
]

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>Experience</h2>
          <p>A timeline of what I've done.</p>
        </div>

        <div className="timeline reveal">
          <div className="timeline__line"></div>
          {experiences.map((exp) => (
            <div
              key={exp.stagger}
              className="titem reveal-stagger"
              style={{ '--stagger': exp.stagger } as React.CSSProperties}
            >
              <div className="titem__dot"></div>
              <div className="tcard">
                <div className="tcard__top">
                  <div className="tcard__title">{exp.title}</div>
                  <div className="pill">{exp.year}</div>
                </div>
                <p className="tcard__text">{exp.text}</p>
                <div className="tags">
                  {exp.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}