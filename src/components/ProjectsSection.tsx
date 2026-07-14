import { useEffect, useRef } from 'react'
import { measureSections } from '../three/scrollStore'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useEnvironment'

type Project = {
  index: string
  title: string
  role: string
  blurb: string
  stack: string[]
  href: string
  live: string
}

/**
 * Real client work. Only genuine projects live here — no fabricated case
 * studies. Add new entries as the portfolio grows.
 */
const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Rising Atelier',
    role: 'Shopify Theme Engineering — Launch',
    blurb:
      'Launched the storefront for a Canadian streetwear label. Hand-coded Shopify theme in Liquid with a conversion-focused product page, fast cart, and motion that stays out of the buyer’s way.',
    stack: ['Shopify', 'Liquid', 'JavaScript', 'CSS'],
    href: 'https://risingatelier.com/',
    live: 'risingatelier.com',
  },
  {
    index: '02',
    title: 'KA Fragrance',
    role: 'Shopify Build — Perfume Brand',
    blurb:
      'Storefront for a Pakistani perfume brand: a custom, high-converting theme with a clean catalogue, localized checkout flow, and a product presentation that makes the scents feel premium.',
    stack: ['Shopify', 'Liquid', 'Theme Dev', 'CRO'],
    href: 'https://kragrance.pk/',
    live: 'kragrance.pk',
  },
]

/**
 * Section — Selected Work.
 *
 * Desktop: the outer <section> is intentionally tall (CSS `--projects-vh`); its
 * inner `.projects-pin` uses `position: sticky` to lock to the viewport for the
 * duration of that tall scroll — no GSAP, no second scroll engine. As the page
 * scrolls through it, `scroll.projectsProgress` runs 0→1 and we translate the
 * card track on X by that fraction of its overflow width. The 3D mesh occupies
 * the empty left lane as the ambient anchor.
 *
 * Mobile / reduced-motion: the pinned horizontal hijack is fragile on touch and
 * disorienting for reduced-motion users, so we render an ordinary vertical
 * stack instead — same content, no pin, no transform, fully native scroll.
 *
 * Accessibility: when a card receives keyboard focus in the horizontal mode, we
 * sync page scroll so the focused card is actually on-screen (transform-based
 * tracks otherwise leave focused-but-invisible content — a known a11y trap).
 */
export function ProjectsSection() {
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const horizontal = !isMobile && !reduced

  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!horizontal) return
    const track = trackRef.current
    const section = sectionRef.current
    if (!track || !section) return

    let rafId = 0
    let maxX = 0
    const measure = () => {
      // How far the track must travel so the last card ends flush in view.
      // Measure the track's full content against its VISIBLE lane (the parent
      // .projects-viewport), not against the track's own box — the track sizes
      // to its content, so track.scrollWidth - track.clientWidth is always 0.
      const lane = track.parentElement as HTMLElement
      maxX = Math.max(0, track.scrollWidth - lane.clientWidth)
      // Size the section so the pinned travel equals exactly one viewport of
      // scroll plus that overflow: 1px of vertical scroll → 1px of horizontal
      // pan. With few cards the section is short; with many it grows. No dead
      // space, so the pan finishes and the section releases together.
      section.style.height = `${window.innerHeight + maxX}px`
      // Section geometry changed → let the store re-measure so the mesh pose
      // and nav stay in sync with the new offsets.
      measureSections()
    }
    measure()
    window.addEventListener('resize', measure)

    // Drive the pan from the section's own scroll position (not the store's
    // normalized progress) so it maps exactly to the pinned travel and the
    // last card lands flush. One compositor-only transform per frame.
    const loop = () => {
      const rect = section.getBoundingClientRect()
      const travel = section.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), travel)
      const p = travel > 0 ? scrolled / travel : 0
      track.style.transform = `translate3d(${-p * maxX}px, 0, 0)`
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    // Focus-sync: map a focused card's horizontal position back to a page
    // scroll offset so keyboard users never focus an off-screen card.
    const onFocusIn = (e: FocusEvent) => {
      const card = (e.target as HTMLElement)?.closest('.project-card')
      if (!card || maxX === 0) return
      const cards = Array.from(track.querySelectorAll('.project-card'))
      const idx = cards.indexOf(card as Element)
      if (idx < 0) return
      const frac = cards.length > 1 ? idx / (cards.length - 1) : 0
      // Invert projectsProgress → absolute page Y within the section's range.
      const top = section.offsetTop
      const range = section.offsetHeight - window.innerHeight
      window.scrollTo({ top: top + frac * range, behavior: 'smooth' })
    }
    track.addEventListener('focusin', onFocusIn)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', measure)
      track.removeEventListener('focusin', onFocusIn)
      // Clear the inline sizing/transform so a switch to the stacked (mobile /
      // reduced-motion) layout isn't overridden by stale desktop values.
      section.style.height = ''
      track.style.transform = ''
      measureSections()
    }
  }, [horizontal])

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={`section section--projects${horizontal ? '' : ' section--projects-stacked'}`}
    >
      <div className="projects-pin">
        <div className="projects-anchor">
          <p className="eyebrow">Portfolio</p>
          <h2 className="section-title">Selected Work</h2>
          <p className="projects-anchor__lead">
            Live storefronts I’ve designed and hand-coded for real brands —
            built for speed, conversion, and a premium feel.
          </p>
          {horizontal && (
            <p className="projects-anchor__hint" aria-hidden="true">
              Scroll to pan →
            </p>
          )}
        </div>

        <div className="projects-viewport">
          <div className="projects-track" ref={trackRef} role="list">
            {PROJECTS.map((p) => (
              <article className="project-card" role="listitem" key={p.title}>
                <div className="project-card__index">
                  {p.index} <span>/ Project</span>
                </div>
                <div className="project-card__body">
                  <h3>{p.title}</h3>
                  <p className="project-card__role">{p.role}</p>
                  <p className="project-card__blurb">{p.blurb}</p>
                </div>
                <div className="project-card__foot">
                  <ul className="project-card__stack">
                    {p.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <a
                    className="project-card__link"
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit {p.live} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
