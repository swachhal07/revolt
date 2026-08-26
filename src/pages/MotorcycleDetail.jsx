import { useParams } from 'react-router-dom'
import DetailHero, { SPECS_ID } from '@/components/motorcycles/DetailHero'
import DetailSpecs from '@/components/motorcycles/DetailSpecs'
import SpecMarquee from '@/components/motorcycles/SpecMarquee'
import DetailFigures from '@/components/motorcycles/DetailFigures'
import NotFound from './NotFound'
import { useLineup } from '@/hooks/useCollection'
import { MOTORCYCLES } from '@/data/motorcycles'

/**
 * One model's page, for whatever is in the catalogue — the bundled array or the
 * one the back office holds. See [[useLineup]] for the fallback contract.
 *
 * The 404 waits for `ready`, and that is the whole reason this reads the store
 * rather than calling `getMotorcycleBySlug`. A model added in the admin is not in
 * the bundled array, so on the first frame it is genuinely not found — and
 * answering that frame with `NotFound` would flash a 404 on a page that is about
 * to render a motorcycle. "Not in the catalogue" is only true once the catalogue
 * has answered; until then the page holds.
 *
 * A bike that *is* bundled renders on the first frame as it always did, because
 * the fallback is what the hook hands back until the store replies.
 */
export default function MotorcycleDetail() {
  const { slug } = useParams()
  const { bikes, ready } = useLineup(MOTORCYCLES)
  const bike = bikes.find((entry) => entry.slug === slug)

  if (!bike) return ready ? <NotFound /> : <Holding />

  return (
    <>
      {/* The frame first, the figures after. The heading and the price the
          section below used to open with are both in the hero now, so repeating
          them here would be the page introducing the same bike twice. */}
      <DetailHero bike={bike} />

      {/* The three figures that decide it, then the table of all of them. The
          anchor is on the first of the two: "View specs" in the hero should land
          a reader on the claim, not on the reference. */}
      <DetailSpecs bike={bike} id={SPECS_ID} />

      {/* The rest of the sheet, running. It takes whatever the fold's rail did
          not, so the band is a continuation of the section above it rather than
          a second telling — and a model whose figures all fit in the rail gets
          no band at all. */}
      <SpecMarquee bike={bike} />

      {/* The whole sheet, ruled. A model can be in the lineup before its figures
          are, so every block inside tests for its own data — an unpriced bike
          reads as a page still being written rather than one that failed to
          load.

          No price here. It is set twice already — over the photograph in the
          hero and again on the lineup card that sent the reader here — and a
          third printing in the middle of a spec table is where a figure goes to
          be missed when it changes. */}
      <DetailFigures bike={bike} />
    </>
  )
}

/**
 * The frame this page occupies while the catalogue is still answering.
 *
 * Deliberately empty — no spinner and no skeleton. Against the local adapter
 * this is one frame, and against the API it is a few hundred milliseconds; a
 * placeholder in that window is a flicker of furniture, which reads worse than
 * white does. The height is what matters: it clears the fixed navbar and holds a
 * viewport, so the footer does not ride up the screen and then get pushed back
 * down when the bike lands.
 */
function Holding() {
  return <div aria-hidden="true" className="min-h-dvh" />
}
