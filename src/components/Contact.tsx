import { useState, useRef } from 'react'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const email = emailRef.current?.value || ''
    const subject = subjectRef.current?.value || ''
    const message = messageRef.current?.value || ''
    setLoading(true)
    setStatus('idle')
    const link = `mailto:nathangsu306@gmail.com`
      + `?subject=${encodeURIComponent('NathanTran.com Notification - ' + subject)}`
      + `&body=${encodeURIComponent('From: ' + email + '\n\n' + message)}`
    setTimeout(() => {
      window.location.href = link
      setLoading(false)
      setStatus('success')
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => setStatus('idle'), 5000)
    }, 800)
  }

  return (
    <section id="contact" className="section">
      <div className="content-wrap">
        <div className="section__head reveal">
          <h2>Contact</h2>
          <p>Always open to new opportunities</p>
        </div>

        <div className="contact-layout reveal">
          {/* Left: form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input type="email" id="email" name="email" placeholder="your.email@example.com" required ref={emailRef} />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" placeholder="What's this about?" required ref={subjectRef} />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} placeholder="Tell me what's on your mind..." required ref={messageRef}></textarea>
            </div>
            <button type="submit" className={`btn btn--primary btn--submit${loading ? ' loading' : ''}`}>
              <span className="btn__text">Send Message</span>
              <span className="btn__loader"></span>
            </button>
            {status === 'success' && (
              <div className="form-status success">Email client opened — send from there!</div>
            )}
          </form>

          {/* Right: direct links */}
          <div className="contact-aside">
            <p className="contact-aside__label">Or reach me directly</p>
            <a className="contact-aside__email" href="mailto:nathangsu306@gmail.com">nathangsu306@gmail.com</a>
            <div className="contact-aside__links">
              <a className="btn" href="https://github.com/ntran306" target="_blank" rel="noreferrer">GitHub</a>
              <a className="btn" href="https://www.linkedin.com/in/ntran306/" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}