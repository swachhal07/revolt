import Container from '@/components/ui/Container'

/**
 * Contact — cleared for redesign.
 *
 * The previous version (dark masthead, photographic panel, numbered index of
 * direct lines) has been removed. The route is kept alive deliberately: five
 * places link here — the navbar button, the footer, NAV_LINKS, the home cost
 * calculator and the motorcycle detail page — and deleting the page would turn
 * all of them into dead ends.
 *
 * Rebuild inside the section below.
 *
 * Still on disk, unused, if any of it is worth keeping:
 *   - components/contact/DirectLines.jsx  — the phone/email/showroom index,
 *     with the Kathmandu-time desk badge
 *   - components/contact/ContactForm.jsx  — the intent-first form and its
 *     validation, submit handling and success receipt
 */
export default function Contact() {
  return (
    // Top padding clears the fixed navbar, which is why an otherwise empty page
    // still needs some.
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink-900">
          Contact
        </h1>
      </Container>
    </section>
  )
}
