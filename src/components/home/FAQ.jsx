import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'
import { formatNpr } from '@/utils/format'
import { FLAGSHIP, PRICED_MOTORCYCLES } from '@/data/motorcycles'

/**
 * Seven questions, answered the way they are answered on the showroom floor, and
 * now the last thing on the home page.
 *
 * The section had this slot once before and lost it: seven headings after four
 * folds of type read as the page arguing with itself, and it was replaced by the
 * charging fold, which answered the one question a reader was actually holding.
 * It is back below the film fold rather than in place of anything — the film is a
 * picture and not an argument, so the page now closes on the frame and then hands
 * over the remaining detail in a form a reader can ignore a row at a time. Nothing
 * here is load-bearing for the case above it; every row is optional by
 * construction, which is the only way seven of them earn a place.
 *
 * Centred, and the list is set loose on the page rather than boxed. It was a tray
 * with a plate inside it for one build, which was wrong for this content: an
 * enclosure says "component", and these are the last seven lines of a page, not a
 * widget on it. Without the box the rules do the work, and the type is free to run
 * at the width the questions want. The centred stack also drops the side rail,
 * which at this point in the page was a second column asking for attention the
 * closing section does not need.
 *
 * What holds it together instead:
 *
 * - A flanked eyebrow, then one heading, then the list, then the one link out. Four
 *   things on one axis, so a reader who has scrolled five folds has nothing left to
 *   choose between.
 * - A heavier rule over the top of the list than between its rows: the list has a
 *   beginning, and hairlines all the way down would have left it starting nowhere.
 * - Numbers. Seven questions with no index read as a wall; 01 to 07 gives a reader
 *   the length of the thing before they start, and the open row takes the red.
 * - No flourish. A volt marker stroke under the heading's second phrase was tried
 *   and removed: against brand red at display size the lime read as a highlighter
 *   left on the artwork. The red phrase is the accent.
 *
 * The section is light between the ink-950 film fold and the ink-950 footer, which
 * is the seam the film fold used to make with the footer on its own — the page
 * still never runs two black slabs into each other.
 *
 * The link goes to the dealer network rather than asking for a test ride. The folds
 * above already made the page's one ask, and a second would read as the site not
 * having listened.
 *
 * Answers open and close by `hidden` rather than by a height transition: a height
 * transition needs a measured pixel value to interpolate toward, and copy that
 * rewraps as the row opens changes that value mid-flight. `hidden` also keeps
 * collapsed copy out of the tab order and off the accessibility tree while leaving
 * it in the HTML, which is what a crawler reads.
 *
 * The figures come off `MOTORCYCLES` rather than being written in, so a spec
 * change cannot leave an answer quoting a number the catalogue no longer does.
 * The range answer is deliberately the exception: it is a band derived from the
 * rated figure, because a single number for Kathmandu would be a promise no hill
 * honours.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// The flagship sets the figures the answers lean on; the entry bike sets the
// bottom of the price range. `ENTRY` is the cheapest bike that actually has a
// price rather than the last one in the array — the catalogue now carries
// models whose figures are still to come, and the array order is a lineup
// order, not a price order.
const BIKE = FLAGSHIP
const ENTRY = PRICED_MOTORCYCLES.reduce((cheapest, bike) =>
  bike.priceNpr < cheapest.priceNpr ? bike : cheapest,
)

const RATED_RANGE = Number.parseFloat(BIKE.specs.range) || 150
const PACK_KWH = Number.parseFloat(BIKE.specs.battery) || 3.24
const CHARGE_HRS = Number.parseFloat(BIKE.specs.chargeTime) || 4.5

// Kathmandu riding against the rated figure. A band, not a number: a single figure
// would be a promise no hill honours.
const REAL_RANGE_LOW = Math.round(RATED_RANGE * 0.62)
const REAL_RANGE_HIGH = Math.round(RATED_RANGE * 0.78)

const WARRANTY_YEARS = 3
const SERVICE_INTERVAL_KM = 5000

const QUESTIONS = [
  {
    id: 'range',
    q: `What range do I actually get, not the ${RATED_RANGE} km on the spec sheet?`,
    a: (
      <>
        Between {REAL_RANGE_LOW} and {REAL_RANGE_HIGH} km on a Kathmandu week
        &mdash; Normal mode, a pillion some days, and the climbs the valley makes
        you do. Sport mode and a full load of shopping take it lower; Eco on flat
        Terai road beats the rated figure. The {RATED_RANGE} km is measured on a
        test cycle, and no test cycle contains Nagarkot.
      </>
    ),
  },
  {
    id: 'price',
    q: 'What does one cost?',
    a: (
      <>
        {formatNpr(ENTRY.priceNpr)} for the {ENTRY.name} up to{' '}
        {formatNpr(BIKE.priceNpr)} for the {BIKE.name}, before registration and
        insurance. That is more up front than a 150cc petrol commuter and less over
        four years, which is the whole argument of the running-cost fold above
        &mdash; the fuel you stop buying is the part that closes the gap, and it
        closes it faster the more you ride.
      </>
    ),
  },
  {
    id: 'charging',
    q: 'What happens to charging when the power goes out?',
    a: (
      <>
        The pack comes out and charges wherever there is a socket, which is the
        whole reason it is removable &mdash; an office desk and a flat on the fourth
        floor both work. Empty to full is about {CHARGE_HRS} hours and it draws
        about as much as a household iron, so an inverter or a modest solar setup
        fills it overnight. You also rarely start from empty; a commute is a
        fraction of the pack.
      </>
    ),
  },
  {
    id: 'monsoon',
    q: 'Can I ride it through monsoon?',
    a: (
      <>
        Rain, yes &mdash; the pack, motor and controller are sealed for it, and a
        wet ride is a wet ride. Standing water is where you use judgement: a flooded
        stretch deep enough to reach the footpegs is deep enough to stop you doing
        it, same as any motorcycle. Charge the pack somewhere dry afterwards rather
        than plugging it in wet, and dry the contacts if you have had it out of the
        bike in the rain.
      </>
    ),
  },
  {
    id: 'performance',
    q: 'Will it keep up in traffic, and carry a pillion up a hill?',
    a: (
      <>
        {BIKE.specs.topSpeed} flat out, and a {BIKE.specs.motor} that gives you all
        of its torque from a standstill &mdash; away from a light it leaves a 150cc
        commuter behind, which is where most Kathmandu overtaking actually happens.
        A pillion up a long climb is what it will do and also what empties the pack
        fastest; that is the trade, and it is the reason the range answer above is a
        band rather than a number.
      </>
    ),
  },
  {
    id: 'service',
    q: 'Who services it, and how often?',
    a: (
      <>
        Our own workshops, at every dealer on the network, every{' '}
        {SERVICE_INTERVAL_KM.toLocaleString('en-IN')} km. There is no engine oil, no
        clutch, no filters and no valve clearance, so a service is brakes, tyres,
        belt tension and a diagnostic pass &mdash; a fraction of what a petrol
        commuter costs to keep on the road. Parts come through the same network
        rather than off a shelf in the market.
      </>
    ),
  },
  {
    id: 'battery',
    q: 'How long does the battery last before it needs replacing?',
    a: (
      <>
        The {PACK_KWH} kWh pack is warranted for {WARRANTY_YEARS} years, and in
        normal use it holds most of its capacity well past that. What you notice
        first is not a failure but a shorter day, a few kilometres at a time. When
        it does need replacing it is a swap rather than a rebuild, and the old pack
        comes back through us instead of going into a landfill.
      </>
    ),
  },
]

export default function FAQ() {
  const [ref, shown] = useReveal({ threshold: 0.06 })
  // The first answer is open on arrival; -1 is all closed, which a reader reaches
  // by closing the one that is open.
  const [openIndex, setOpenIndex] = useState(0)

  const rise = (delay) =>
    cn(
      'transition-[transform,opacity,filter] duration-1000',
      EASE,
      delay,
      shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-8 opacity-0 blur-[6px]',
    )

  return (
    <section
      id="questions"
      ref={ref}
      // Top padding is deliberately the smaller half of the pair. The section above
      // is a film that ends on 22px of flat black, which already reads as air above
      // this heading — the full 24/28/32 on top of it left the eyebrow floating a
      // third of a screen down from the seam. The bottom keeps its full measure,
      // since what follows is the footer and the last answer should not butt into it.
      className="bg-ink-50 pt-14 pb-28 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-36"
    >
      {/* Narrower than the page's own container. The list is rules and type with
          nothing to the side of it, so the measure is the only thing keeping the
          questions from running to 90 characters on a wide window. */}
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        {/* ── The head ──────────────────────────────────────────────────────── */}
        {/* The eyebrow: a label between two rules that run out to the measure's own
            edges, which is the masthead the contact and about pages open with — same
            gap, same hairline at 12% ink, same red at 11px and 0.2em. It is the
            site's way of establishing a centre axis before a centred headline lands,
            and this section is the only other place that needs one, so it is the
            same object rather than a variation on it. `flex-1` on the rules is what
            makes them meet the edges at any width; fixed-width rules left the label
            floating in the middle of a wide window with white either side. */}
        <div className={cn('flex items-center gap-5', rise('delay-0'))}>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
            Questions
          </p>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
        </div>

        {/* One heading, centred, and the largest type on the lower half of the
            page. `text-balance` is what stops the last line arriving alone: at this
            size a widow is a third of a line of white across the middle of the
            section. */}
        <h2
          className={cn(
            'mt-6 text-center font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-900 text-balance',
            rise('delay-75'),
          )}
        >
          The questions we get asked{' '}
          {/* The phrase carries the red on its own. There was a volt marker stroke
              under it for one build — the palette's second pole meeting the first
              once on the page — and it came off: against brand red at display size
              the lime read as a highlighter left on the artwork rather than as an
              accent, and the heading is already the loudest thing in the section
              without it. `whitespace-nowrap` stays: the phrase is what the sentence
              turns on and it should never break across two lines. */}
          <span className="whitespace-nowrap text-brand-600">in the showroom</span>
        </h2>

        {/* ── The list ──────────────────────────────────────────────────────── */}
        {/* A heavier rule over the top than between the rows — the list has a
            beginning, and a hairline there would have left it starting nowhere. No
            rule under the last row: the section's own bottom edge closes it. */}
        <div className={cn('mt-14 border-t border-ink-900/25 sm:mt-16', rise('delay-100'))}>
          {QUESTIONS.map((item, i) => {
            const isOpen = i === openIndex

            return (
              <div
                key={item.id}
                className={cn(i > 0 && 'border-t border-ink-900/10')}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${item.id}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className={cn(
                      'group flex w-full items-start gap-5 py-6 text-left sm:gap-8 sm:py-7',
                      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500',
                    )}
                  >
                    {/* The index, set at the question's own size and on its own
                        column so seven of them stand on one vertical edge. Tabular
                        figures, because 01 and 07 have to occupy the same width for
                        that edge to exist. It takes the red on the open row, which
                        is the cheapest possible marker: no rule, no fill, no dot. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'w-[2ch] shrink-0 font-display text-xl font-bold tabular-nums tracking-[-0.02em]',
                        'transition-colors duration-500',
                        EASE,
                        isOpen ? 'text-brand-600' : 'text-ink-900/25',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={cn(
                        'flex-1 font-display text-xl leading-[1.35] font-bold tracking-[-0.025em] text-pretty sm:text-2xl',
                        'transition-colors duration-500',
                        EASE,
                        isOpen ? 'text-brand-600' : 'text-ink-900 group-hover:text-brand-600',
                      )}
                    >
                      {item.q}
                    </span>

                    {/* The indicator: two hairlines that rotate 45° together, so the
                        plus becomes a cross — which says "close" where a minus only
                        says "less". Nothing swaps, nothing preloads, nothing
                        reflows. The rotation snaps rather than easing: transitioning
                        `rotate` here froze the computed value at whichever state the
                        row mounted in, and an indicator wants to snap in any case.
                        The ring it sits in carries the motion instead — it fills on
                        open and lifts a little under the cursor. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-full',
                        'transition-[transform,background-color,box-shadow,color] duration-500',
                        EASE,
                        'group-hover:scale-105',
                        isOpen
                          ? 'bg-brand-600 text-white shadow-[0_8px_20px_-10px_rgba(225,25,25,0.9)]'
                          : 'text-ink-900/45 ring-1 ring-ink-900/15 ring-inset group-hover:text-brand-600 group-hover:ring-brand-600/40',
                      )}
                    >
                      <span
                        className={cn('relative block size-3', isOpen ? 'rotate-45' : 'rotate-0')}
                      >
                        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
                      </span>
                    </span>
                  </button>
                </h3>

                {/* `hidden` rather than a height transition — see the note at the top
                    of this file. It keeps collapsed copy out of the tab order and off
                    the accessibility tree while leaving it in the HTML for crawlers.
                    `animate-rise` is the design system's own keyframe and replays
                    each time a row is shown; reduced motion is handled globally in
                    index.css.

                    Indented past the index to the question's own text column, so the
                    answer hangs off the same edge the question does, and held to
                    ~64ch: the row is wider than prose wants to be. */}
                <div
                  id={`faq-a-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-q-${item.id}`}
                  hidden={!isOpen}
                >
                  <p className="max-w-[64ch] animate-rise pb-8 pl-[calc(2ch+1.25rem)] text-base leading-[1.75] text-ink-800/75 text-pretty sm:pb-9 sm:pl-[calc(2ch+2rem)] sm:text-lg">
                    {item.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── The way out ───────────────────────────────────────────────────── */}
        {/* One line and one control, on the same axis as everything above. The pill
            carries its arrow in a well of its own rather than loose beside the
            label: the well is what makes the whole thing read as a single machined
            object, and it gives the hover something to move inside. The pill takes
            the press and the well takes the travel. */}
        <div className={cn('mt-14 flex flex-col items-center gap-5 sm:mt-16', rise('delay-150'))}>
          <p className="text-center text-base leading-relaxed text-ink-800/70">
            Anything else is better asked in person.
          </p>

          <Link
            to="/dealers"
            className={cn(
              'group inline-flex items-center gap-3 rounded-full bg-ink-900 py-2 pr-2 pl-6',
              'text-base font-semibold text-white',
              'shadow-[0_1px_2px_rgba(5,5,5,0.16),0_18px_36px_-24px_rgba(5,5,5,0.55)]',
              'transition-[transform,background-color] duration-500',
              EASE,
              'hover:bg-ink-800 active:scale-[0.985]',
              'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500',
            )}
          >
            Find your nearest workshop
            <span
              aria-hidden="true"
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full bg-white/12',
                'ring-1 ring-white/12 ring-inset',
                'transition-[transform,background-color] duration-500',
                EASE,
                'group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 group-hover:bg-brand-500',
              )}
            >
              {/* Drawn here rather than imported: two strokes at the weight the rest
                  of the site's marks are drawn at, and no icon set to load for one
                  arrow. */}
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
                <path
                  d="M3.5 12.5 12.5 3.5M6 3.5h6.5V10"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
