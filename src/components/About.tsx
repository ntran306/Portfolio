export default function About() {
  return (
    <section id="about" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>About</h2>
          <p>A little bit about me.</p>
        </div>

        <div className="about-photos reveal">
          <div className="photo-diamond photo-diamond--1">
            <div className="photo-diamond__placeholder">Photo 1</div>
          </div>
          <div className="photo-diamond photo-diamond--2">
            <div className="photo-diamond__placeholder">Photo 2</div>
          </div>
          <div className="photo-diamond photo-diamond--3">
            <div className="photo-diamond__placeholder">Photo 3</div>
          </div>
        </div>

        <div className="panel reveal">
          <p>
            Write 4–6 sentences: what you're into, what you're building, and what you want next.
            Keep it simple and confident.
          </p>
        </div>
      </div>
    </section>
  )
}