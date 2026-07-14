import { ServicesSection } from './ServicesSection'
import { ProjectsSection } from './ProjectsSection'
import { ContactForm } from './ContactForm'

/**
 * The scrollable HTML layer that sits above the fixed 3D canvas.
 *
 * Section order MUST match SECTIONS in scrollStore.ts:
 *   hero → about → services → projects → contact
 * The store measures each <section id> to map scroll position onto the mesh's
 * per-section poses, so the ids here are load-bearing.
 */
export function Sections() {
  return (
    <main className="content">
      {/* 1 — Hero */}
      <section id="hero" className="section section--hero">
        <div className="hero-inner">
          <p className="eyebrow">Huzaifa Habib · Karachi, PK</p>
          <h1 className="hero-title">
            I build fast, high-converting
            <br />
            web experiences.
          </h1>
          <p className="hero-sub">
            Freelance developer specialising in custom web apps, hand-coded
            Shopify &amp; WordPress themes, and Chrome extensions. Clean code,
            real performance, built to convert.
          </p>
          <div className="hero-cta">
            <a className="btn btn--primary" href="#projects">
              See my work
            </a>
            <a className="btn btn--ghost" href="#contact">
              Start a project
            </a>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <span className="scroll-hint__line" />
        </div>
      </section>

      {/* 2 — About */}
      <section id="about" className="section section--about">
        <div className="panel">
          <p className="eyebrow">About</p>
          <h2 className="section-title">Developer, not a page-builder.</h2>
          <p>
            I’m Huzaifa — a developer from Karachi who builds the whole thing by
            hand. Whether it’s a MERN application, a custom Shopify theme, or a
            Manifest V3 Chrome extension, I care about the same things: fast load
            times, clean maintainable code, and interfaces that turn visitors
            into customers.
          </p>
          <p>
            I’ve shipped live storefronts for real brands across Canada and
            Pakistan, and I treat every project like it’s my own product.
          </p>
          <ul className="tag-list">
            <li>MERN Stack</li>
            <li>C# / .NET</li>
            <li>Shopify · Liquid</li>
            <li>WordPress · Twig</li>
            <li>Chrome · MV3</li>
            <li>Performance &amp; SEO</li>
          </ul>
        </div>
      </section>

      {/* 3 — Services */}
      <ServicesSection />

      {/* 4 — Projects (pinned horizontal on desktop, stacked on mobile) */}
      <ProjectsSection />

      {/* 5 — Contact */}
      <section id="contact" className="section section--contact">
        <div className="panel panel--contact">
          <p className="eyebrow">Contact</p>
          <h2 className="section-title">Let’s build something that converts.</h2>
          <p>
            Have a store, an app, or an extension in mind? Tell me about it and
            I’ll get back within a couple of days. Prefer email? Reach me at{' '}
            <a href="mailto:huzaifahabib098@gmail.com">huzaifahabib098@gmail.com</a>.
          </p>
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
