import { useState, useRef } from 'react'
import { links, contact } from '../content'
import Object3D from './Object3D'

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
    const link = `mailto:${links.email}`
      + `?subject=${encodeURIComponent(contact.emailSubjectPrefix + subject)}`
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
          <h2>{contact.heading}</h2>
          <p>{contact.subhead}</p>
        </div>

        <div className="contact-layout reveal">
          {/* Left: form + direct handles */}
          <div className="contact-main">
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

            <div className="contact-direct">
              <span className="contact-direct__label">Or reach me directly</span>
              <div className="contact-direct__row">
                <a className="contact-aside__email" href={`mailto:${links.email}`}>{links.email}</a>
                <a className="btn" href={links.github} target="_blank" rel="noreferrer">GitHub</a>
                <a className="btn" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>

          {/* Right: interactive 3D object placeholder */}
          <div className="contact-obj-wrap">
            <Object3D />
          </div>
        </div>
      </div>
    </section>
  )
}