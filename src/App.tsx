import './index.css'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Home from './components/Home'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import useReveal from './hooks/useReveal'

function App() {
  useReveal()

  return (
    <>
      <Loader />
      <Nav />
      <main className="wrap">
        <Home />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
        <footer className="footer">
          <span>© {new Date().getFullYear()} Nathan Tran</span>
        </footer>
      </main>
    </>
  )
}

export default App