import { useRef, useState } from 'react'

/**
 * Contact form — Section 5.
 *
 * Security & anti-abuse (this is the one place that takes user input, so it
 * gets real attention):
 *   - All fields length-capped and trimmed; email shape validated.
 *   - Honeypot field (`company`) hidden from humans; if filled, we treat the
 *     submit as a bot and silently succeed without sending.
 *   - No dangerouslySetInnerHTML anywhere; React escapes all rendered values.
 *   - Submits as JSON to VITE_CONTACT_ENDPOINT when configured (e.g. Formspree,
 *     a Worker, your own API). If it's not set, we fall back to a prefilled
 *     mailto: so the form is never a dead end — and we never expose a secret,
 *     because the endpoint is a public form URL, not an API key.
 *
 * Note for deployment: whatever endpoint you use should do its OWN server-side
 * validation and spam filtering. Client validation is UX, not a security
 * boundary — never trust the browser.
 */

const LIMITS = { name: 80, email: 120, message: 2000 } as const
const CONTACT_EMAIL = 'huzaifahabib098@gmail.com'
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

type Status = 'idle' | 'sending' | 'sent' | 'error'

// Pragmatic email check: one @, a dot in the domain, no spaces. Deliberately
// not RFC-5322-exhaustive — the server is the real validator.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim().slice(0, LIMITS.name)
    const email = String(data.get('email') ?? '').trim().slice(0, LIMITS.email)
    const message = String(data.get('message') ?? '').trim().slice(0, LIMITS.message)

    // Honeypot: real users can't see or fill this. A value means a bot.
    if (honeypotRef.current?.value) {
      setStatus('sent') // Pretend success; send nothing.
      form.reset()
      return
    }

    if (!name || !email || !message) {
      setError('Please fill in your name, email, and a message.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('That email address doesn’t look right — mind checking it?')
      return
    }

    // No endpoint configured yet → open the user's mail client, prefilled.
    if (!ENDPOINT) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`)
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
      setStatus('sent')
      form.reset()
      return
    }

    try {
      setStatus('sending')
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch {
      // Never leak internal error detail to the UI; offer the mailto path.
      setStatus('error')
      setError(
        `Something went wrong sending that. You can email me directly at ${CONTACT_EMAIL}.`,
      )
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-success" role="status">
        <h3>Thanks — message on its way.</h3>
        <p>I’ll get back to you within a couple of days. Talk soon.</p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot: visually hidden, off the tab order, ignored by humans. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          ref={honeypotRef}
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={LIMITS.email}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={LIMITS.message}
          required
        />
      </div>

      {error && (
        <p className="contact-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="submit-btn" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
