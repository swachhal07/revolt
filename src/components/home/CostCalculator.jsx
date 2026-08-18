import { useState } from 'react'
import Button from '@/components/ui/Button'
import { ArrowUpRight } from '@/components/ui/icons'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'
import { MOTORCYCLES } from '@/data/motorcycles'

/**
 * The sum, written out as a comparison rather than drawn.
 *
 * This replaces a gauge — one volt bar whose length was the year's saving. It
 * read well and it answered the wrong question: a reader wanting to know what a
 * petrol bike costs them a month had to take the length of a bar on trust and
 * find the figure in a line of small print. What convinces here is not a shape
 * but a table with two columns in it, because the claim is a comparison and a
 * comparison wants both sides on the page at the same time.
 *
 * So: the argument and the answer on the left, the instrument and its evidence on
 * the right. The saving is stated once, big, on a volt field — the one place on
 * this page that colour is spent — and the table underneath the slider shows the
 * two costs it came from, monthly and yearly, in the units a household budgets
 * in. Nothing here has to be inferred from a picture.
 *
 * Dark, not the light field this layout is usually built on. The fold sits
 * between two white sections and the volt block needs a black ground to be the
 * brightest thing in it; on white the same block reads as a highlighter mark.
 * ink-950, the same OLED black as the hero and the battery fold.
 *
 * The energy cost is derived from the catalogue rather than typed in here — pack
 * size over rated range, divided by charge efficiency — so changing a bike's
 * specs in `motorcycles.js` moves this section with it. CHARGE_EFFICIENCY is the
 * wall loss; ignoring it would understate running cost in our own favour.
 *
 * Confirm PETROL_PRICE and UNIT_RATE before this ships. They are current-ish, not
 * authoritative, and every figure in the table is built on them. They are printed
 * under it for the same reason: a calculator that will not show its inputs is one
 * nobody can check.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const CHARGE_EFFICIENCY = 0.85 // wall-to-pack loss

const PETROL_PRICE = 181 // Rs. per litre
const PETROL_MILEAGE = 45 // km per litre, 150cc commuter
const UNIT_RATE = 15 // Rs. per unit (kWh)

const DAYS_PER_MONTH = 30
const DAYS_PER_YEAR = DAYS_PER_MONTH * 12 // riding days, not calendar days
const KM_MIN = 5
const KM_MAX = 120

// The flagship sets the figure. Specs are prose in the catalogue ("3.24 kWh"),
// so the numbers come off the front of the string.
const BIKE = MOTORCYCLES[0]
const PACK_KWH = Number.parseFloat(BIKE.specs.battery) || 3.24
const RANGE_KM = Number.parseFloat(BIKE.specs.range) || 150

const PETROL_PER_KM = PETROL_PRICE / PETROL_MILEAGE
const CHARGE_PER_KM = (PACK_KWH / RANGE_KM / CHARGE_EFFICIENCY) * UNIT_RATE

// Nepali grouping — Rs. 52,431 rather than Rs. 52.431.
const rupees = (n) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`

export default function CostCalculator() {
  const [ref, shown] = useReveal({ threshold: 0.12 })
  const [km, setKm] = useState(40)

  const petrolMonth = PETROL_PER_KM * km * DAYS_PER_MONTH
  const chargeMonth = CHARGE_PER_KM * km * DAYS_PER_MONTH
  const savedYear = (petrolMonth - chargeMonth) * 12

  const sliderPct = ((km - KM_MIN) / (KM_MAX - KM_MIN)) * 100

  // Two rows, each a period, each with both sides of the comparison on it. Built
  // here rather than inline so the table body stays a loop over data.
  const ROWS = [
    { period: 'Monthly', petrol: petrolMonth, electric: chargeMonth },
    { period: 'Yearly', petrol: petrolMonth * 12, electric: chargeMonth * 12 },
  ]

  // One observer, two delays — the argument, then the instrument beside it. Cheap
  // properties only, so the entrance stays on the compositor.
  const rise = (delay) =>
    cn(
      'transition-[transform,opacity,filter] duration-1000',
      EASE,
      delay,
      shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-10 opacity-0 blur-[6px]',
    )

  return (
    <section
      id="running-cost"
      ref={ref}
      className="relative overflow-hidden bg-ink-950 pt-20 pb-24 text-white sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36"
    >
      {/* Painted light only — a blur filter on a scrolling section repaints every
          frame. One source, top-left, white. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_0%,rgba(255,255,255,0.07),transparent_65%)]"
      />

      {/* Wider than the site's 72rem column, and deliberately so. Everything else
          on the page is a heading over a photograph, which wants a measure; this
          is a control beside a table, and both of them get better the more room
          they have — the figures stop crowding their labels and the slider gets
          a travel long enough to set a distance precisely. Capped at 100rem so it
          stops short of edge-to-edge on a wide desktop, with wider gutters than
          Container's to keep it off the glass. */}
      <div className="relative mx-auto w-full max-w-[100rem] px-4 sm:px-8 lg:px-12">
        {/* Two rows, not two columns of independent stacks. Grid cells in a row
            stretch to the tallest of them, so with the volt block and the table
            each set to grow inside their cell, the two of them end on the same
            line at every width — no magic heights, nothing to re-tune when a
            figure gets a digit longer. The button and the small print take the
            second row, which is what frees the first row to align. */}
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-x-20 xl:gap-x-28">
          {/* ── The argument and the answer ──────────────────────────────── */}
          <div className={cn('flex flex-col', rise('delay-0'))}>
            <h2 className="max-w-xl font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance">
              Do the maths on your{' '}
              {/* The two words that make the claim personal, in the brand red.
                  brand-500 rather than 600 — on ink-950 the darker step drops to
                  4:1 and this is the one coloured phrase in the fold. */}
              <span className="text-brand-500">own commute</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60 text-pretty">
              Set your daily distance and see what a petrol commuter costs you
              against the {BIKE.name} &mdash; every month, and every year.
            </p>

            {/* The one place colour is spent on this page. Volt is the tokens'
                electric pole; the saving is the electric argument, so the block
                is the colour rather than merely trimmed with it. Ink on volt is
                ~14:1 — the figure carries at any size. */}
            {/* `flex-1` and `justify-between`: the block takes whatever height the
                row has and spends it between the figure and the line under the
                rule, rather than leaving a pocket of green at the bottom. */}
            <div className="mt-10 flex flex-1 flex-col justify-between gap-8 bg-volt-400 px-7 py-8 text-ink-950 sm:px-9 sm:py-10">
              {/* Announced as one region so a screen reader hears the saving once
                  a drag settles, rather than a digit at a time. */}
              <div aria-live="polite">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-ink-950/70 uppercase">
                  Annual savings
                </p>

                <p className="mt-4 font-display text-[clamp(2.75rem,6.5vw,4.25rem)] leading-none font-bold tracking-[-0.045em] tabular-nums">
                  {rupees(savedYear)}
                </p>
              </div>

              {/* The figure in something other than money. A year of fuel is an
                  abstraction; a year of fuel expressed as the thing it buys is
                  the sentence people repeat to whoever they share a budget
                  with. Derived, so it cannot drift from the number above it. */}
              <p className="flex items-start gap-2.5 border-t border-ink-950/15 pt-5 text-sm leading-relaxed font-medium text-ink-950/80">
                <span aria-hidden="true" className="mt-px shrink-0 text-base leading-none">
                  &#9670;
                </span>
                About {Math.round(savedYear / PETROL_PRICE).toLocaleString('en-IN')}{' '}
                litres of petrol you never queue for.
              </p>
            </div>

          </div>

          {/* ── The instrument and its evidence ──────────────────────────── */}
          {/* `min-w-0`: a grid item's default `min-width: auto` refuses to shrink
              below its content, so the table's own min-width would push the whole
              column past the viewport instead of letting the wrapper scroll. */}
          <div className={cn('flex min-w-0 flex-col gap-4', rise('delay-150'))}>
            {/* Two panels, not one: the control is a thing you touch and the table
                is a thing you read, and running them together made a form out of
                a comparison. Hairline surfaces rather than cards — on black, a
                1px ring is enough to say "panel" without drawing a box. */}
            <div className="bg-white/[0.04] px-6 py-7 ring-1 ring-inset ring-white/10 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <div className="shrink-0">
                  <label
                    htmlFor="daily-km"
                    className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase"
                  >
                    Daily commute
                  </label>
                  <p className="mt-2 font-display text-4xl leading-none font-bold tracking-[-0.03em] tabular-nums sm:text-5xl">
                    {km} <span className="text-white/50">km</span>
                  </p>
                </div>

                {/* The track fill is painted, not animated: it tracks a drag, and
                    a transition on it would lag the thumb by its own duration. */}
                <input
                  id="daily-km"
                  type="range"
                  min={KM_MIN}
                  max={KM_MAX}
                  step={1}
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  aria-label="Kilometres ridden a day"
                  aria-valuetext={`${km} kilometres a day`}
                  style={{
                    background: `linear-gradient(to right, var(--color-brand-600) 0%, var(--color-brand-400) ${sliderPct}%, rgba(255,255,255,0.1) ${sliderPct}%)`,
                  }}
                  className={cn(
                    'h-2 w-full cursor-pointer appearance-none rounded-full sm:mt-1',
                    'focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-brand-400',
                    '[&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
                    '[&::-webkit-slider-thumb]:border-[6px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-500',
                    '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-500',
                    // Written out — Tailwind scans source text, so an
                    // interpolated class name would never be generated.
                    '[&::-webkit-slider-thumb]:ease-[cubic-bezier(0.32,0.72,0,1)]',
                    'hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95',
                    '[&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[6px]',
                    '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-500',
                    '[&::-moz-range-track]:bg-transparent',
                  )}
                />
              </div>
            </div>

            {/* A real table, because it is one: two periods against two
                motorcycles. Screen readers get the row and column headers, and
                `tabular-nums` keeps the rupee columns aligned digit for digit as
                the slider moves. */}
            {/* Grows into whatever the row gives it, and the table inside is
                `h-full` so the extra height goes into the rows as air around the
                figures rather than into a gap under the last one. */}
            <div className="flex flex-1 overflow-hidden bg-white/[0.04] ring-1 ring-inset ring-white/10">
              <div className="w-full overflow-x-auto">
                {/* 20rem, not 26: at 320px the three columns still fit a 375px
                    phone once the cells drop to px-4, so the common case reads
                    without a sideways scroll and the wrapper only takes over
                    below that. */}
                <table className="h-full w-full min-w-[20rem] border-collapse text-left">
                  <caption className="sr-only">
                    Fuel and charging cost at {km} kilometres a day
                  </caption>
                  <thead>
                    <tr className="border-b border-white/10">
                      <th
                        scope="col"
                        className="px-4 py-5 font-display text-base font-bold tracking-[-0.01em] sm:px-8"
                      >
                        Running cost
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-5 text-right text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase"
                      >
                        Petrol bikes
                      </th>
                      {/* The one column that is ours, marked as ours — volt on the
                          heading rather than a highlight behind the cells, which
                          would have fought the figures for attention. */}
                      <th
                        scope="col"
                        className="px-4 py-5 text-right text-[10px] font-semibold tracking-[0.16em] text-volt-400 uppercase sm:px-8"
                      >
                        Revolt bikes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr
                        key={row.period}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        <th
                          scope="row"
                          className="px-4 py-6 text-sm font-medium text-white/70 sm:px-8"
                        >
                          {row.period}
                        </th>
                        <td className="px-2 py-6 text-right font-display text-base font-bold tabular-nums text-white/70 sm:text-xl">
                          {rupees(row.petrol)}
                        </td>
                        <td className="px-4 py-6 text-right font-display text-base font-bold tabular-nums text-white sm:px-8 sm:text-xl">
                          {rupees(row.electric)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ── Second row: the decision, and the fine print ─────────────── */}
          {/* Hairline glass, and the only thing a hover changes is the arrow: it
              lifts. Red already belongs to the slider thumb in this fold, and a
              pill that filled red under the cursor made itself the loudest thing
              on a surface whose point is the comparison. */}
          <div className={cn('flex items-start', rise('delay-300'))}>
            <Button
              to="/contact"
              size="lg"
              variant="glass"
              iconMotion="lift"
              trailingIcon={<ArrowUpRight className="size-4" />}
            >
              Book a test ride
            </Button>
          </div>

          {/* The inputs, printed. Every figure in the table rests on these three
              rates and two of them move with the market. */}
          <p className={cn('max-w-3xl text-xs leading-relaxed text-white/50', rise('delay-300'))}>
            <span className="font-semibold text-white/70">Assumptions.</span>{' '}
            Petrol at Rs. {PETROL_PRICE} a litre against a 150cc commuter doing{' '}
            {PETROL_MILEAGE} km/l (Rs. {PETROL_PER_KM.toFixed(2)}/km), and charging
            at Rs. {UNIT_RATE} a unit for the {BIKE.name}&rsquo;s {PACK_KWH} kWh
            pack over its {RANGE_KM} km rated range, allowing{' '}
            {Math.round((1 - CHARGE_EFFICIENCY) * 100)}% charging loss (Rs.{' '}
            {CHARGE_PER_KM.toFixed(2)}/km). Figured over {DAYS_PER_MONTH} riding
            days a month. Servicing, tyres and insurance are not counted on either
            side, and real-world range will move the charging figure.
          </p>
        </div>
      </div>
    </section>
  )
}
