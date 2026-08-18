import Container from '@/components/ui/Container'

/**
 * Motorcycles — cleared for redesign.
 *
 * This is the lineup page only. The detail route (motorcycles/:slug,
 * MotorcycleDetail.jsx) is untouched and still renders, so the individual bike
 * pages keep working while this one is rebuilt.
 *
 * The route is kept alive deliberately: the navbar and footer both link here.
 *
 * Still on disk, unused by this page, if any of it is worth keeping:
 *   - components/motorcycles/MotorcycleGrid.jsx
 *   - components/motorcycles/MotorcycleCard.jsx
 *   - data/motorcycles.js is untouched and still feeds the detail page
 */
export default function Motorcycles() {
  return (
    // Top padding clears the fixed navbar, which is why an otherwise empty page
    // still needs some.
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink-900">
          Motorcycles
        </h1>
      </Container>
    </section>
  )
}
