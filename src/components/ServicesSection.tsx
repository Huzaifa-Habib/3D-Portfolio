type Service = {
  index: string
  title: string
  summary: string
  points: string[]
}

/**
 * Section — Services. Huzaifa's three real offerings. Copy is written to sell:
 * each card leads with the outcome, then lists what's actually delivered.
 */
const SERVICES: Service[] = [
  {
    index: '01',
    title: 'Custom Web Development',
    summary:
      'Fast, scalable web apps built from the ground up — no page builders, no bloat. Just clean, maintainable code that does exactly what your business needs.',
    points: ['MERN stack (MongoDB, Express, React, Node)', 'C# / .NET backends', 'REST & real-time APIs', 'Performance-first architecture'],
  },
  {
    index: '02',
    title: 'CMS & Theme Development',
    summary:
      'High-converting WordPress and Shopify stores with fully custom-coded themes — the flexibility of a CMS with the polish of a bespoke build.',
    points: ['Shopify themes in Liquid', 'WordPress themes with Twig', 'Custom, conversion-focused UX', 'Full hand-coding — not drag-and-drop'],
  },
  {
    index: '03',
    title: 'Chrome Extension Development',
    summary:
      'Secure, modern browser extensions on Manifest V3 — automation, productivity tools, and integrations that extend your workflow right in the browser.',
    points: ['Manifest V3 architecture', 'Secure content & background scripts', 'Chrome Web Store publishing', 'Third-party API integration'],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="section section--services">
      <div className="services-inner">
        <header className="services-head">
          <p className="eyebrow">What I do</p>
          <h2 className="section-title">Services</h2>
          <p className="services-lead">
            Three focused offerings — each one hand-built, performance-obsessed,
            and shipped to convert.
          </p>
        </header>

        <div className="services-grid">
          {SERVICES.map((s) => (
            <article className="service-card" key={s.title}>
              <div className="service-card__index">{s.index}</div>
              <h3>{s.title}</h3>
              <p className="service-card__summary">{s.summary}</p>
              <ul className="service-card__points">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
