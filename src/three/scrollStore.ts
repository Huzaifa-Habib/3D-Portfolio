/**
 * Non-reactive scroll store.
 *
 * Lenis writes into `scroll` on every RAF tick; the R3F scene reads it inside
 * `useFrame`. Because these values live outside React state, scrolling never
 * triggers a component re-render — the 3D layer stays at 60fps and only the
 * GPU does work per frame.
 *
 * Section boundaries are MEASURED from the real DOM (each <section id> top
 * offset), not assumed to be equal-height. This matters because the Projects
 * section is intentionally tall (it pins and scrolls its cards horizontally),
 * so a naive "progress * (n-1)" would race the mesh through its states. With
 * measured offsets, `sectionProgress` advances by exactly 1.0 per section
 * regardless of that section's height, and the mesh holds its Projects pose
 * for the whole pin.
 *
 * A tiny subscribe/emit channel is provided for the rare HTML pieces that DO
 * need to react (e.g. an active-section indicator in the nav).
 */

export type Section = 'hero' | 'about' | 'services' | 'projects' | 'contact'

export const SECTIONS: Section[] = ['hero', 'about', 'services', 'projects', 'contact']

export const scroll = {
  /** Raw scroll offset in pixels. */
  y: 0,
  /** Total scrollable height in pixels (scrollHeight - innerHeight). */
  limit: 0,
  /** Normalized progress across the whole page, 0..1. */
  progress: 0,
  /** Instantaneous scroll velocity from Lenis. */
  velocity: 0,
  /**
   * Fractional section index, e.g. 1.5 = halfway between About and Projects.
   * Derived from measured section offsets, so it advances by 1.0 per section
   * regardless of each section's pixel height.
   */
  sectionProgress: 0,
  /** Index of the section currently occupying most of the viewport. */
  activeIndex: 0,
  /**
   * 0..1 progress THROUGH the Projects section specifically. Drives the
   * horizontal card track. 0 = just entered, 1 = about to leave.
   */
  projectsProgress: 0,
}

/**
 * Measured top offset (in px) of each section, in SECTIONS order. Populated by
 * `measureSections()` on mount and on resize. Falls back to an even split
 * before the first measurement so nothing divides by zero.
 */
let offsets: number[] = []

/** Read each section's document-relative top from the DOM. */
export function measureSections(): void {
  const next: number[] = []
  for (const id of SECTIONS) {
    const el = document.getElementById(id)
    if (!el) return // DOM not ready yet; keep any previous measurement.
    const rect = el.getBoundingClientRect()
    next.push(rect.top + window.scrollY)
  }
  offsets = next
}

type Listener = (active: Section) => void
const listeners = new Set<Listener>()

/** Subscribe to active-section changes. Returns an unsubscribe fn. */
export function onSectionChange(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

let lastActive = -1

/**
 * Convert an absolute scroll offset into a fractional section index using the
 * measured offsets. Section i spans [offsets[i], offsets[i+1]); progress within
 * it is linear. The last section runs from its top to the scroll limit.
 */
function toSectionProgress(y: number, limit: number): number {
  if (offsets.length !== SECTIONS.length) {
    // Pre-measurement fallback: assume equal spans.
    return limit > 0 ? (y / limit) * (SECTIONS.length - 1) : 0
  }
  for (let i = 0; i < SECTIONS.length - 1; i++) {
    const start = offsets[i]
    const end = offsets[i + 1]
    if (y < end) {
      const span = Math.max(1, end - start)
      return i + Math.min(1, Math.max(0, (y - start) / span))
    }
  }
  // In or past the final section.
  const start = offsets[SECTIONS.length - 1]
  const span = Math.max(1, limit - start)
  return SECTIONS.length - 1 + Math.min(1, Math.max(0, (y - start) / span))
}

/**
 * Called by the Lenis loop each tick. Recomputes derived scroll values and
 * emits a section-change event only when the active section actually flips.
 */
export function updateScroll(y: number, limit: number, velocity: number): void {
  scroll.y = y
  scroll.limit = limit
  scroll.velocity = velocity
  scroll.progress = limit > 0 ? y / limit : 0

  const sp = toSectionProgress(y, limit)
  scroll.sectionProgress = sp

  // Projects is index 2; its fractional part is the horizontal-track driver.
  const projectsIndex = SECTIONS.indexOf('projects')
  scroll.projectsProgress = Math.min(1, Math.max(0, sp - projectsIndex))

  const active = Math.round(sp)
  scroll.activeIndex = active

  if (active !== lastActive) {
    lastActive = active
    const section = SECTIONS[active]
    listeners.forEach((fn) => fn(section))
  }
}
