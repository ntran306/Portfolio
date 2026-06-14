import { useEffect, useState } from 'react'

export default function Loader() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`loader${hidden ? ' hidden' : ''}`}>
      <div className="loader__spinner"></div>
      <div className="loader__text">Loading...</div>
    </div>
  )
}