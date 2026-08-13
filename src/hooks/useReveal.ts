import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting)
      }
    }, { threshold: 0.15 })

    const seen = new WeakSet<Element>()
    const scan = () => {
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        if (!seen.has(el)) {
          seen.add(el)
          io.observe(el)
        }
      })
    }
    scan()

    // Components swap whole subtrees after mount (e.g. Experience switching
    // between its pinned and compact variants on resize), so keep scanning for
    // reveal elements the initial query couldn't have seen.
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])
}
