import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'
import { formatNpr } from '@/utils/format'
import { MOTORCYCLES } from '@/data/motorcycles'


const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// The flagship sets the figures the answers lean on; the entry bike sets the
// bottom of the price range.
const BIKE = MOTORCYCLES[0]
const ENTRY = MOTORCYCLES[MOTORCYCLES.length - 1]

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
        four years, which is the whole argument of the fold above this one &mdash;
        the fuel you stop buying is the part that closes the gap, and it closes it
        faster the more you ride.
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
      className="bg-white pt-14 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-36"
      ref={ref}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Rail and list. Twelve columns at lg so the rail gets a third and the
            questions keep their measure — a 5/7 split gives the heading a line
            long enough not to break every three words and still leaves the
            answers around 60ch at 1280px. One column
            below that: on a phone the rail is simply the section's opening. */}
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          {/* ── The rail ──────────────────────────────────────────────────── */}
          {/* Sticky from lg up, and only there — a rail that follows the scroll
              on a phone is a rail that eats the viewport. `self-start` is what
              lets it stick inside a grid cell that would otherwise stretch to the
              height of the list beside it. */}
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            {/* Set to the running-cost fold's display size so the two closing
                sections speak at the same volume. leading-[1.02] rather than that
                fold's 0.95: this heading wraps to three lines, and Plus Jakarta
                Sans needs about 0.96em between baselines before descenders reach
                the next line's ascenders. "the showroom" takes the red: the
                phrase that says these are the answers given in person, which is
                the section's whole claim. */}
            <h2
              className={cn(
                'font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.04em] text-ink-900 text-balance',
                rise('delay-0'),
              )}
            >
              The questions we get asked in{' '}
              <span className="text-brand-600">the showroom</span>
            </h2>

            <p
              className={cn(
                'mt-5 max-w-[44ch] text-base leading-[1.7] text-ink-800/80 text-pretty sm:text-lg',
                rise('delay-75'),
              )}
            >
              Seven that come up on the floor most days, answered the way we answer
              them standing next to the bike.
            </p>

            {/* The address, in the rail rather than trailing the list. A reader
                who stops after two questions still has it on screen. A link, not
                a pill — a button here would read as a second ask, and the fold
                above already made the one this page is allowed. */}
            <div
              className={cn(
                'mt-8 border-t border-ink-900/12 pt-6 sm:mt-10',
                rise('delay-150'),
              )}
            >
              <p className="text-base leading-relaxed text-ink-800/70">
                Anything else is better asked in person.
              </p>
              <Link
                to="/dealers"
                className={cn(
                  'group mt-2 inline-flex items-baseline gap-1.5 text-lg font-semibold text-ink-900',
                  'transition-colors duration-300',
                  EASE,
                  'hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                )}
              >
                <span className="border-b border-ink-900/25 pb-0.5 transition-colors duration-300 group-hover:border-brand-600/40">
                  Find your nearest workshop
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-block transition-transform duration-500',
                    EASE,
                    'group-hover:translate-x-1',
                  )}
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* ── The list ──────────────────────────────────────────────────── */}
          {/* A bottom edge on the list, a top edge on every row. The open row
              carries a brand rule down its left edge for the height of the
              question and the answer together, so the marker has the same extent
              as the thing that is open. */}
          <div
            className={cn('border-b border-ink-900/12 lg:col-span-7', rise('delay-100'))}
          >
            {QUESTIONS.map((item, i) => {
              const isOpen = i === openIndex

              return (
                <div
                  key={item.id}
                  // Rules switch rather than fade. `transition-colors` here
                  // interpolated from `oklab(… / 0.12)` to a hex and froze at the
                  // start value; an indicator wants to snap in any case. The left
                  // border is always 2px and always present so the row does not
                  // shift by two pixels when it opens — closed rows carry it
                  // transparent.
                  className={cn(
                    'border-t border-l-2 border-ink-900/12 pl-4 sm:pl-6',
                    isOpen ? 'border-l-brand-600' : 'border-l-transparent',
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${item.id}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${item.id}`}
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      className={cn(
                        'group flex w-full items-start justify-between gap-5 py-6 text-left sm:gap-10 sm:py-7',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                      )}
                    >
                      <span
                        className={cn(
                          'font-display text-lg leading-[1.35] font-bold tracking-[-0.02em] text-pretty sm:text-xl',
                          isOpen ? 'text-ink-900' : 'text-ink-900/65 group-hover:text-ink-900',
                        )}
                      >
                        {item.q}
                      </span>

                      {/* Two hairlines that rotate 45° together — the plus becomes
                          a cross, which says "close" where a minus only says
                          "less". No swapped glyph, nothing to preload, nothing
                          that reflows. The rotation snaps: transitioning it here
                          froze the computed `rotate` at whichever value the row
                          mounted with, the same fault this file documents for
                          height and colour transitions. An indicator wants to
                          snap in any case. `mt-2` sits it on the first line's
                          optical centre now that the row aligns to the top
                          rather than the middle. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'relative mt-2 block size-3.5 shrink-0',
                          isOpen
                            ? 'rotate-45 text-brand-600'
                            : 'rotate-0 text-ink-900/40 group-hover:text-ink-900',
                        )}
                      >
                        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
                      </span>
                    </button>
                  </h3>

                  {/* `hidden` rather than a height transition — see the note at
                      the top of this file. It keeps collapsed copy out of the tab
                      order and off the accessibility tree while leaving it in the
                      HTML for crawlers. `animate-rise` is the design system's own
                      keyframe and replays each time the row is shown; reduced
                      motion is handled globally in index.css. */}
                  <div
                    id={`faq-a-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-q-${item.id}`}
                    hidden={!isOpen}
                  >
                    <p className="max-w-[62ch] animate-rise pb-7 text-base leading-[1.7] text-ink-800/85 text-pretty sm:pb-8 sm:text-lg">
                      {item.a}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
