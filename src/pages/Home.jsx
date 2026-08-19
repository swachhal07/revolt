import Hero from '@/components/home/Hero'
import FeaturedBikes from '@/components/home/FeaturedBikes'
import SwappableBattery from '@/components/home/SwappableBattery'
import RevOS from '@/components/home/RevOS'
import CostCalculator from '@/components/home/CostCalculator'
import Charging from '@/components/home/Charging'
import RideModes from '@/components/home/RideModes'
import FAQ from '@/components/home/FAQ'

/**
 * The page closes on the one objection arithmetic cannot answer.
 *
 * This last slot has been rebuilt four times. A "why electric" card row and a
 * dark "ride one before you decide" slab held it first, and both restated what
 * the sections above them had already made: the cards were the running-cost fold
 * in three sentences, and the slab asked for a test ride that fold had already
 * asked for. An FAQ replaced them and went through three builds of its own — a
 * ruled ledger, a spec plate, then a seven-question accordion that shipped.
 *
 * The accordion came out because seven headings is the page arguing with itself.
 * Everything below the fold on this page is type, and by this point a reader has
 * had four sections of it; the question they are actually holding is narrower
 * than seven, and it is where you plug the bike in when the power goes. So the
 * slot is now the charging section: one claim, two beats, and a photograph that
 * changes with the copy.
 *
 * It runs after the running-cost fold rather than before it. The fold makes the
 * financial case and charging is the objection a reader raises against a case
 * that good, so it belongs after the claim. The cost of that order is that the
 * black fold is no longer the last thing on the page, which is exactly what the
 * charging section is for: it is white, and it is the seam between that fold and
 * the ink-950 footer. Without it the page ends in one unbroken block of black.
 *
 * Charging.jsx documents the two beats and why the meter and the clock are the
 * same object.
 *
 * Then a fold that is a picture rather than an argument. Everything from the
 * running-cost fold down is reasoning: what it saves, where it charges. The page
 * should not hand a reader over to the footer mid-sentence, so the closing frame
 * is the bike on a flyover — the one thing you cannot change beside the one thing
 * you can. RideModes.jsx documents the film's own arrival.
 *
 * The FAQ is last, and it is back after having lost this slot once. What was wrong
 * with it then was its position, not its content: seven headings cannot be the
 * argument's last word. After the film they are not — the case is made, the page
 * has stopped talking, and what remains is detail a reader takes a row at a time or
 * skips entirely. It also puts a white section between the film fold and the black
 * footer, which is the alternation the whole lower half of this page is built on.
 */
export default function Home() {
  return (
    <>
      <Hero />

      <FeaturedBikes />

      <SwappableBattery />

      <RevOS />

      <CostCalculator />

      <Charging />

      <RideModes />

      <FAQ />
    </>
  )
}
