import Container from '@/components/ui/Container'

/**
 * About — cleared for redesign.
 *
 * The route is kept alive deliberately: the navbar links here (HEADER_PATHS in
 * Navbar.jsx) and so does NAV_LINKS via the footer, so deleting the page would
 * turn both into dead ends.
 *
 * Rebuild inside the section below.
 */
export default function About() {
  return (
    // Top padding clears the fixed navbar, which is why an otherwise empty page
    // still needs some.
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink-900">
          About
        </h1>
      </Container>
    </section>
  )
}
