import { useParams } from 'react-router-dom'
import DetailHero, { SPECS_ID } from '@/components/motorcycles/DetailHero'
import DetailSpecs from '@/components/motorcycles/DetailSpecs'
import SpecMarquee from '@/components/motorcycles/SpecMarquee'
import DetailFigures from '@/components/motorcycles/DetailFigures'
import NotFound from './NotFound'
import { getMotorcycleBySlug } from '@/data/motorcycles'

export default function MotorcycleDetail() {
  const { slug } = useParams()
  const bike = getMotorcycleBySlug(slug)

  if (!bike) return <NotFound />

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
