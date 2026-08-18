import Container from '@/components/ui/Container'

/**
 * Blog — cleared for redesign.
 *
 * Added as a route at the same time as the footer entry that points at it: the
 * footer numbers every destination on the site, so a label there with no route
 * behind it would have dropped visitors on the 404 page.
 *
 * Rebuild inside the section below.
 */
export default function Blog() {
  return (
    // Top padding clears the fixed navbar, which is why an otherwise empty page
    // still needs some.
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink-900">
          Blog
        </h1>
      </Container>
    </section>
  )
}
