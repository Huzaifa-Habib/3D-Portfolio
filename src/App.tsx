import { Scene } from './three/Scene'
import { Sections } from './components/Sections'
import { useLenis } from './three/useLenis'
import './App.css'

/**
 * App root. Two stacked layers:
 *   - <Scene>    fixed, full-viewport R3F canvas (behind, pointer-events: none)
 *   - <Sections> the scrollable HTML content (in front)
 *
 * useLenis() boots smooth scrolling + section measurement once, here at the
 * root. Everything else reads scroll state from the non-reactive store.
 */
function App() {
  useLenis()

  return (
    <>
      {/* Skip link for keyboard users — first focusable element. */}
      <a className="skip-link" href="#projects">
        Skip to work
      </a>
      <Scene />
      <Sections />
    </>
  )
}

export default App
