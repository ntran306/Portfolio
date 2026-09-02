import HomeBall from './HomeBall'
import { hero } from '../content'

export default function Home() {
  return (
    <section id="home" className="home home--full">
      <HomeBall />

      <div className="home__content wrap">
        <div className="hero reveal">
          <span className="hero__eyebrow">{hero.eyebrow}</span>
          <h1 className="hero__headline">{hero.headline}</h1>
          <p className="hero__sub">{hero.tagline}</p>
        </div>
      </div>

      {/* Layered wave divider marking the Home → About boundary. Stroked rather
          than filled, since the page colour is identical on both sides. */}
      <svg
        className="home__waves"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="homeWaveFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7fdcff" stopOpacity="0" />
            <stop offset=".5" stopColor="#6aa6ff" stopOpacity="1" />
            <stop offset="1" stopColor="#7fdcff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="home__wave home__wave--back"
          vectorEffect="non-scaling-stroke"
          d="M0,88 C160,58 320,58 480,88 C640,118 800,118 960,88 C1120,58 1280,58 1440,88"
        />
        <path
          className="home__wave home__wave--mid"
          vectorEffect="non-scaling-stroke"
          d="M0,138 C120,164 240,164 360,138 C480,112 600,112 720,138 C840,164 960,164 1080,138 C1200,112 1320,112 1440,138"
        />
        <path
          className="home__wave home__wave--front"
          vectorEffect="non-scaling-stroke"
          d="M0,110 C120,76 240,76 360,110 C480,144 600,144 720,110 C840,76 960,76 1080,110 C1200,144 1320,144 1440,110"
        />
      </svg>
    </section>
  )
}
