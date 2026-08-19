import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Container from '@/components/ui/Container'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/utils/cn'
import boostMode from '@/assets/images/detail-boost-mode.avif'
import console_ from '@/assets/images/detail-tft-color.avif'
import hillHold from '@/assets/images/detail-hill-hold.avif'
import ledLights from '@/assets/images/detail-radiant-led-lights.avif'
import monoShock from '@/assets/images/detail-rvx-mono-shock.avif'
import tankPanel from '@/assets/images/detail-rvx-carbon-fiber.avif'

/**
 * A centred detail carousel driven by the page scroll rather than by buttons.
 *
 * The band is a tall wrapper with a sticky frame inside it. While the wrapper is
 * passing the viewport the frame holds still, and how far the wrapper has moved
 * through it decides which slide is centred — so scrolling down walks the reader
 * through the details and then releases the page. No arrows, and no scroll
 * hijacking either: the page never stops responding to the wheel, it just has a
 * stretch where the thing on screen changes instead of moving.
 *
 * The centring itself is measured, not calculated in CSS. Slide widths are
 * viewport percentages and the gap is a token, so the offset that puts slide N
 * in the middle is `frameWidth / 2 - (slideLeft + slideWidth / 2)`, read off the
 * DOM after layout and re-read on resize. In `calc()` it would mean restating
 * those widths and getting them wrong on one breakpoint.
 *
 * The renders came in as PNGs between 1.3MB and 19MB — 45MB for the set, which
 * is not shippable — and are used here as AVIFs converted off them at 2400px
 * wide, 258KB for all six. The PNGs stay in `assets/images` as the masters.
 *
 * Two of them sit on white and four on black. Rather than force one plate colour
 * and have half the set read as a hole in the page, each slide states the ground
 * its render was shot against and the plate follows it.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

/** Scroll distance given to each slide after the first, as a share of the
 *  viewport height. Shorter and the set flicks past before it reads; longer and
 *  the page feels stuck. */
const SCROLL_PER_SLIDE = 0.7

// COPY NEEDS SIGN-OFF. Each line is written off what its render actually shows
// and claims nothing beyond it — no figures, because the numbers on the console
// render are a demo state rather than a spec.
const DETAILS = [
  {
    id: 'boost',
    title: 'Boost mode',
    body: 'Held under the right thumb for the overtake that needs to be over quickly. The same throttle, a different map behind it.',
    image: boostMode,
    alt: 'A rider on a blue RVX at speed, light trails wrapping the bike',
    ground: 'dark',
  },
  {
    id: 'console',
    title: 'Colour TFT console',
    body: 'Speed, charge, distance to empty, trip and the ride mode you are in, on one panel — and the phone paired to it in the corner.',
    image: console_,
    alt: 'The handlebar and colour TFT instrument panel of an RVX',
    ground: 'dark',
  },
  {
    id: 'hill-hold',
    title: 'Hill hold',
    body: 'Holds the bike where you stopped it on a gradient, without the brake and without rolling back onto whoever is behind you. Kathmandu is built on gradients.',
    image: hillHold,
    alt: 'A rider stopped on an incline at dusk, hill hold engaged',
    ground: 'dark',
  },
  {
    id: 'lighting',
    title: 'Full LED lighting',
    body: 'Headlamp, running lamps and indicators all LED, drawing less out of the pack than a bulb would and lasting the life of the bike.',
    image: ledLights,
    alt: 'A blue RVX head-on, lighting lit',
    ground: 'light',
  },
  {
    id: 'monoshock',
    title: 'Monoshock rear',
    body: 'One spring and a linkage instead of a pair of shocks, which keeps the rear wheel tracking on a surface that changes every hundred metres.',
    image: monoShock,
    alt: 'Close crop of the RVX rear monoshock and linkage',
    ground: 'dark',
  },
  {
    id: 'tank',
    title: 'Carbon-fibre tank panel',
    body: 'The panel you actually touch, and the keyless power button set into it — press it and the bike is on. There is nothing to turn.',
    image: tankPanel,
    alt: 'The RVX tank from above, carbon-fibre panel and power button',
    ground: 'dark',
  },
]

// The set with an edge clone at each end: the last detail before the first, the
// first after the last. Centring slide one leaves half a screen of empty paper
// on its left otherwise, and the same on the right of the last one — the frame
// stops reading as a set continuing past the screen and starts reading as one
// picture that happens to be off-centre. The clones are never active and never
// counted; they exist so both edges always have something being cut by them.
const SLIDES = [
  { ...DETAILS[DETAILS.length - 1], key: 'clone-head', clone: true },
  ...DETAILS.map((detail) => ({ ...detail, key: detail.id })),
  { ...DETAILS[0], key: 'clone-tail', clone: true },
]

export default function DetailCarousel() {
  const headingRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.06 })

  const [index, setIndex] = useState(0)
  const [offset, setOffset] = useState(0)

  const wrapperRef = useRef(null)
  const frameRef = useRef(null)
  const trackRef = useRef(null)

  const last = DETAILS.length - 1

  // Which slide the wrapper's progress through the viewport lands on. Read in a
  // rAF callback because scroll fires far more often than a frame renders.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let frame = 0

    const read = () => {
      frame = 0

      const { top, height } = wrapper.getBoundingClientRect()
      const travel = height - window.innerHeight
      if (travel <= 0) return

      const progress = Math.min(Math.max(-top / travel, 0), 1)
      setIndex(Math.round(progress * last))
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [last])

  // Centres the active slide in the frame. `index + 1` because the track carries
  // a clone in front of the real first slide.
  const measure = useCallback(() => {
    const frame = frameRef.current
    const slide = trackRef.current?.children[index + 1]
    if (!frame || !slide) return

    setOffset(frame.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2))
  }, [index])

  useLayoutEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  return (
    // The wrapper carries the same ground as the band pinned inside it, so no
    // white seam can show at either end of the travel.
    <div
      ref={wrapperRef}
      className="relative bg-ink-950"
      style={{ height: `calc(100svh + ${last * SCROLL_PER_SLIDE * 100}svh)` }}
    >
      {/* Sticky rather than fixed, so the band releases the page on its own at
          both ends.

          The top padding clears the fixed navbar and then some. At the navbar's
          own height the nameplate pins flush against its bottom edge with no air
          at all, and the label reads as part of the bar rather than as the top of
          a band; 8rem leaves it standing clear.

          Height is exactly one viewport — `h-svh`, not `min-h-svh`. A sticky
          element taller than the screen stops holding and lets its foot scroll
          away, which on a short laptop screen means the ticks disappear. Fixing
          the height and letting the crop take the slack instead means the band
          fits every screen by construction. */}
      <section className="sticky top-0 flex h-svh flex-col overflow-hidden bg-ink-950 pt-32 pb-12 text-white sm:pt-36">
        {/* The ref sits on a wrapper, not on Container — Container takes only a
            className and children, so a ref passed to it would be dropped. */}
        <Container className="max-w-[84rem] shrink-0">
          {/* The nameplate and headline are set in plain white here rather than
              carrying the red the other bands open with — on this much black the
              accent was the loudest thing in the frame, and the photographs are
              what the band is for. The rules go to white/15: a hairline that
              reads at 12% ink on paper is invisible at 12% white on black. */}
          {/* The trigger sits on a plain wrapper rather than on the nameplate
              itself: the reveal is the nameplate and the headline together, and
              [[useScrollReveal]] animates the marked descendants of the element
              it is given. ScrollTrigger measures the wrapper's static position,
              which is above the band's pinning range, so the entrance is over
              before the sticky section takes hold. */}
          <div ref={headingRef}>
            <div data-reveal className="flex items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
              <p className={cn(LABEL, 'text-white')}>Why Revolt</p>
              <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
            </div>

            <h2
              data-reveal
              className="mx-auto mt-5 max-w-[20ch] text-center font-display text-[clamp(1.875rem,4.4vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-white text-balance"
            >
              Precision in every <span className="block">detail.</span>
            </h2>
          </div>
        </Container>

        {/* The frame runs the full width of the viewport rather than the
            container, so the neighbouring slides are cut by the screen edge
            instead of by a margin — which is what makes the set read as
            continuing past the frame rather than as three cards. */}
        <div ref={frameRef} className="mt-8 min-h-0 flex-1 overflow-hidden sm:mt-10">
          <ul
            ref={trackRef}
            className={cn(
              'relative flex h-full items-stretch gap-6 lg:gap-10',
              'transition-transform duration-700',
              EASE,
            )}
            style={{ transform: `translate3d(${offset}px, 0, 0)` }}
          >
            {SLIDES.map((detail, slideIndex) => {
              const active = slideIndex === index + 1

              return (
                <li
                  key={detail.key}
                  aria-current={active ? 'true' : undefined}
                  // A clone is scenery: it is the same picture and caption a
                  // reader will meet for real, so it is read out twice unless it
                  // is hidden from the accessibility tree.
                  aria-hidden={detail.clone ? 'true' : undefined}
                  className={cn(
                    'flex h-full flex-col',
                    'w-[84vw] shrink-0 sm:w-[64vw] lg:w-[48vw]',
                    // Dimmed rather than blurred, so a detail shot on either side
                    // is still readable enough to be worth scrolling towards.
                    'transition-opacity duration-700',
                    EASE,
                    active ? 'opacity-100' : 'opacity-35',
                  )}
                >
                  {/* The crop takes the height left over after the heading and
                      the caption, so it is the part that gives on a short
                      screen. `min-h-0` because a flex child will not shrink
                      below its content without it.

                      The plate matches the render's own ground, so the edge of
                      the photograph is where the picture ends rather than a step
                      between two different blacks or two different whites. */}
                  <div
                    className={cn(
                      'min-h-0 flex-1 overflow-hidden ring-1',
                      // Both grounds now sit on black, so both rings are white:
                      // the dark renders need an edge or they bleed into the
                      // band, and the one light render needs its own so the
                      // white does not look like a hole cut in the page.
                      detail.ground === 'dark'
                        ? 'bg-ink-950 ring-white/[0.12]'
                        : 'bg-ink-50 ring-white/[0.12]',
                    )}
                  >
                    <img
                      src={detail.image}
                      alt={detail.alt}
                      // The head clone and the first real slide are both on
                      // screen the moment the band arrives, so neither is a lazy
                      // candidate; everything after them is.
                      loading={slideIndex <= 1 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Title left, body right, both under the crop — one column at
                      this width sets to a measure far longer than it reads at. */}
                  <div className="mt-6 grid shrink-0 gap-x-10 gap-y-3 sm:grid-cols-2">
                    <h3 className="max-w-[22ch] font-display text-[1.25rem] leading-[1.2] font-bold tracking-[-0.025em] text-white text-balance sm:text-[1.375rem]">
                      {detail.title}
                    </h3>
                    {/* white/60 rather than an ink grey: a fixed grey that reads
                        as secondary on paper reads as switched-off on black. */}
                    <p className="max-w-[44ch] text-[15px] leading-[1.65] text-white/60 text-pretty">
                      {detail.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

      </section>
    </div>
  )
}
