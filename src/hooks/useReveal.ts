import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger')
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting)
      }
    }, { threshold: 0.15 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}