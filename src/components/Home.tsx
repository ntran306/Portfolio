import { useRef } from 'react'
import HomeBall, { type BallState } from './HomeBall'
import HomeWaves from './HomeWaves'
import { hero } from '../content'

export default function Home() {
  // Shared, mutated in place by HomeBall each frame and read by HomeWaves, so
  // the ball can splash into the water without either owning the other.
  const ball = useRef<BallState>({ x: 0, y: 0, r: 0, vx: 0, vy: 0, ready: false })

  return (
    <section id="home" className="home home--full">
      <HomeWaves ballRef={ball} />
      <HomeBall stateRef={ball} />

      <div className="home__content wrap">
        <div className="hero reveal">
          <span className="hero__eyebrow">{hero.eyebrow}</span>
          <h1 className="hero__headline">{hero.headline}</h1>
          <p className="hero__sub">{hero.tagline}</p>
        </div>
      </div>
    </section>
  )
}
