import { useEffect } from 'react'
import Lenis from 'lenis'
import { measureSections, updateScroll } from './scrollStore'

/**
 * Boots Lenis smooth scrolling and pipes its per-tick state into the
 * non-reactive `scrollStore`. Runs a single RAF loop for the whole app.
 *
 * Returns nothing — consumers read scroll state from the store, not from here,
 * so this hook can live once at the app root without causing re-renders.
 */
export function useLenis(): void {
  useEffect(() => {
    const lenis = new Lenis({
      // Gentle, weighty feel. duration is in seconds; the easing is a standard
      // expo-out curve that decelerates smoothly at the end of each scroll.
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have momentum; let the OS handle it.
      syncTouch: false,
    })

    lenis.on('scroll', ({ scroll, limit, velocity }) => {
      updateScroll(scroll, limit, velocity)
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Section offsets are layout-dependent: measure after first paint and on
    // any resize (font load, viewport change) so the mesh↔section mapping and
    // the horizontal track stay accurate. Lenis.resize() re-reads scroll limit.
    const measure = () => {
      lenis.resize()
      measureSections()
    }
    // Defer the initial measure one frame so the DOM has laid out.
    const t = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(t)
      window.removeEventListener('resize', measure)
      lenis.destroy()
    }
  }, [])
}
