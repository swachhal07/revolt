import Hero from '@/components/home/Hero'
import FeaturedBikes from '@/components/home/FeaturedBikes'
import SwappableBattery from '@/components/home/SwappableBattery'
import RevOS from '@/components/home/RevOS'
import CostCalculator from '@/components/home/CostCalculator'
import FAQ from '@/components/home/FAQ'

/**
 * The page closes on the arithmetic.
 *
 * A "why electric" card row and a dark "ride one before you decide" slab held
 * this last slot first, and both restated what the sections above them had
 * already made: the cards were the running-cost fold in three sentences, and the
 * slab asked for a test ride that fold had already asked for. An FAQ replaced
 * them and went through two more builds that came out again — a ruled ledger with
 * a figure in every band, then a spec plate over four full-width answers. Both
 * were light-ground, hairline-ruled, typography-only sections, which is the lane
 * that failed rather than any detail in them.
 *
 * The section that stayed is a seven-question accordion on the black, one answer
 * open at a time. The count is what changed the argument: at four questions an
 * open list beats a disclosure, and at seven it is a wall.
 *
 * It runs after the running-cost fold rather than before it. The fold makes the
 * financial case and the questions are what a reader raises against a case that
 * good — the section is the reply to it, and a reply belongs after the claim. The
 * cost of that order is that the black fold is no longer the last thing on the
 * page, so the questions have to close it instead, which is why they end on an
 * address rather than trailing off.
 *
 * The page therefore runs dark from the running-cost fold through the questions
 * and into the footer, breaking the strict black/white alternation the folds above
 * keep. That is the closing movement, and FAQ.jsx documents how it stays distinct
 * from the fold it follows.
 */
export default function Home() {
  return (
    <>
      <Hero />

      <FeaturedBikes />

      <SwappableBattery />

      <RevOS />

      <CostCalculator />

      <FAQ />
    </>
  )
}
