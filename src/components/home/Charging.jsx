import { useEffect, useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'
import { FLAGSHIP } from '@/data/motorcycles'

// Both frames are the RV400 on a wall box at dusk, one on a house porch and one
// outside an office. Masters were 2304x1856 and 1409x1148 PNGs, 9.2MB for the
// pair; re-encoded to 1800px AV1 stills at crf 32 they are 245KB for the pair,
// which is what a fold that loads two photographs at once can afford:
//   ffmpeg -i <master>.png -vf scale=1800:-2 -c:v libaom-av1 \
//     -still-picture 1 -crf 32 -cpu-used 4 <name>.avif
// Both are 5:4, and they are drawn `object-cover` into a panel that measures
// about 1.07 on a desktop window, so roughly a fifteenth comes off each side and
// the window leans right to keep the charger. Any replacement wants the bike and
// the charger inside the middle 85%: the charger in the office frame is at 80%
// and it is the closest thing in either frame to the edge.
import chargingHome from '@/assets/images/charging-home.avif'
import chargingOffice from '@/assets/images/charging-office.avif'

/**
 * Where the bike charges, in two answers.
 *
 * This slot held a seven-question accordion, and the questions were the page
 * arguing with itself: seven headings, none of them a picture, sitting between
 * the running-cost fold and the footer. What a reader actually wants at the
 * bottom of this page is the one objection the fold above cannot answer with
 * arithmetic — where do you plug it in, in a city that loses power. So the slot
 * became a single claim with two photographs under it.
 *
 * Two beats, not five. Home and work are where a bike in this city spends its
 * night and its day, and both photographs are the same act: one wall, one cable,
 * no queue. A third tab would have to be invented.
 *
 * The composition is a split fold rather than a column beside a picture. The
 * photograph takes the right half of the *viewport*, edge to edge and full
 * height, so it reads as the surface the fold is cut into rather than as an
 * illustration in a grid cell.
 *
 * The type does not sit in the site's Container, which is the one place this fold
 * breaks with the five above it. Inside a centred max-w-6xl the copy would start
 * a quarter of the way into its own half, with the widest gap on the page between
 * the window edge and the first letter and the photograph pushing from the other
 * side. Bled type against bled picture is the composition; a container edge in
 * the middle of it is a margin nobody asked for. So the left half carries its own
 * gutter, wide enough to breathe at 80px on a large window and collapsing to the
 * site's phone gutter below `lg`, where the split comes apart anyway.
 *
 * Claim at the top of the half, beat and controls at the bottom of it. The gap
 * between them is the fold's height, and it is doing the same job the empty left
 * third of the battery fold does.
 *
 * The clock and the meter are the same object. The rule under the active control
 * runs a `meter` keyframe for exactly the dwell, and its `animationend` is what
 * advances the beat — so anything that pauses the animation pauses the advance
 * with it, with nothing to keep in sync and no drift between a CSS duration and
 * a JS interval. Two consequences worth knowing:
 *
 * - Reduced motion cannot use it. index.css forces every animation to 0.01ms
 *   under `prefers-reduced-motion`, which would fire `animationend` immediately
 *   and spin the section. So the setting is read in JS, the meter is not mounted,
 *   and the two controls are the only way through. That is the right degradation
 *   in any case: a reader who asked for less motion did not ask for a slideshow.
 * - The loop stops when the section is off screen. `useReveal` is one-shot, so a
 *   second observer tracks the section both ways purely to hold the clock.
 *
 * White, and that is structural. The running-cost fold above is ink-950 and so
 * is the footer below; this is the seam between them, and without it the page
 * ends in one unbroken block of black.
 *
 * Below `lg` the split cannot hold — half a phone screen is not a photograph —
 * so the picture goes back into flow at 4:3 above the type, which is the order
 * the app fold uses on a phone for the same reason.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// Three seconds on each beat. Deliberately quick: there are only two of them,
// and the point of the rotation is to show that the second one exists — a long
// dwell reads as a static panel that occasionally twitches. The cost is a
// reader still on the last line when the panel climbs; the two controls under
// it are what pays that, since the beat they were reading is one click away and
// stays put once they take it.
// This is the only number to change to retime the section. The meter's
// animation runs for exactly this long and its `animationend` is the advance, so
// the rule and the clock cannot drift apart.
const DWELL = 3000

const BIKE = FLAGSHIP
// The catalogue's own figure, so the section cannot drift from the spec sheet.
const CHARGE_HRS = Number.parseFloat(BIKE.specs.chargeTime) || 4.5

// The two places a bike in Kathmandu actually spends its night and its day. Both
// are the same act, which is the point: one wall, one cable, no queue.
const BEATS = [
  {
    id: 'home',
    // The control's label, not a number. "01 / 02" would tell a reader something
    // they can already count.
    label: 'At home',
    image: chargingHome,
    alt: 'An RV400 on a house porch at dusk, plugged into a Revolt wall charger',
    headline: 'It charges where you already park it',
    body: 'The box goes on the wall where you park and the bike plugs into it. Full by morning on a normal domestic supply. If the power goes, the pack comes out and fills from any socket.',
    value: `${CHARGE_HRS} hrs`,
    figure: 'Empty to full at home',
  },
  {
    id: 'office',
    label: 'At the office',
    image: chargingOffice,
    alt: 'An RV400 charging from a wall box in an office forecourt at dusk',
    headline: 'And again at work, while you are upstairs',
    body: 'A parking bay and a wall is the whole requirement, so the ride home charges itself during the day. On a valley commute you are topping up rather than filling.',
    value: '1 hr 20 min',
    figure: '0 to 80% on a fast charge',
  },
]

export default function Charging() {
  const [ref, shown] = useReveal({ threshold: 0.12 })
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)
  const [near, setNear] = useState(false)
  const [unwatched, setUnwatched] = useState(false)

  // Every part of this fold is gated behind the entrance, and an observer on a
  // page nobody is looking at never fires — a background tab, a print, a
  // headless screenshotter would all take the section away blank rather than
  // just take its entrance away. If the document is already hidden at mount,
  // skip the choreography and be there; once it becomes visible the observer
  // does its own job. Same guard as the battery and app folds above.
  useEffect(() => {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') return

    setUnwatched(true)
  }, [])

  // `autoPlay`-style motion again: CSS cannot be asked whether the reader wants
  // it, because the reduce block in index.css answers by crushing the duration
  // rather than by removing the animation. Same read as the battery fold.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setStill(query.matches)

    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // Holds the clock while the section is out of view, and lets it go again on
  // the way back. Deliberately separate from the entrance above: that one fires
  // once and disconnects, this one has to keep listening. No observer means no
  // gate, which leaves the section running rather than frozen.
  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }

    // Threshold 0 rather than a fraction of the section. A fraction is the
    // wrong unit for a band this tall: 20% of a section approaching a full
    // screen high meant scrolling a fifth of a viewport past its top edge
    // before the clock started, so the first beat only began once the reader
    // was already well into it. The bottom margin holds it back just enough
    // that the section has arrived rather than merely appeared.
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      threshold: 0,
      rootMargin: '0px 0px -12% 0px',
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  // A background tab keeps its animations running in some engines and throttles
  // them in others. Neither is worth guessing at, so the clock stops with the
  // document.
  useEffect(() => {
    const apply = () => setPaused(document.visibilityState !== 'visible')

    apply()
    document.addEventListener('visibilitychange', apply)
    return () => document.removeEventListener('visibilitychange', apply)
  }, [])

  const here = shown || unwatched
  // `here` as well as `near`: the panel fades in on the entrance, and without
  // that term the first beat could spend its three seconds behind an opacity of
  // zero — the clock would be a beat ahead of what the reader has seen.
  const running = !still && near && here
  const current = BEATS[active]

  const go = (next) => setActive(((next % BEATS.length) + BEATS.length) % BEATS.length)

  // Two controls read as one list, so the arrows walk them.
  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step === undefined) return

    event.preventDefault()
    go(active + step)
  }

  return (
    <section
      ref={ref}
      id="charging"
      className="relative isolate overflow-hidden bg-white"
      // Hovering does not pause the beat. A pointer resting in a fold this
      // large is not a claim on it — the section is most of a screen, so a
      // pointer left anywhere near the middle of the window is inside it — and
      // a beat that stops whenever the cursor lands reads as broken rather than
      // considerate.
      //
      // Keyboard focus still pauses, which is a different case: a reader who
      // has tabbed to one of the two controls has committed to it, and swapping
      // the panel under a focused button changes what the next key press does.
      // Capture rather than the focus events on each control, so tabbing
      // between the two does not release the pause for a frame.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* ── The photograph ──────────────────────────────────────────────────
          Both images stay mounted rather than one `src` being swapped: a swap
          shows the gap while the next file decodes, on the first pass every time
          and on a slow connection every pass. Mounted, the transition is between
          two decoded images.

          `overflow-hidden` is doing real work here and not just tidying corners:
          it is what hides the incoming frame while it waits a full panel-height
          below the bottom edge. ink-50 underneath in case a frame has not decoded
          yet, so the panel is a grey plate rather than a white hole. No radius and
          no ring: it is bled to the edge of the window, so there is no frame to
          draw. */}
      <div
        id="charging-frame"
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden bg-ink-50',
          // Well past half. At a straight 50/50 the panel came out around 0.90
          // wide to tall against photographs that are 1.24, so `object-cover`
          // scaled to the height and threw away a seventh of the width from each
          // side — which is exactly where the wall charger is in the office frame,
          // and the charger is the thing this fold is about. At 58% the panel is
          // about 1.16 at every desktop width, within a twentieth of the frames,
          // so the crop stops eating the subject.
          'lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[55%] xl:w-[58%]',
          // Opacity only. A half-viewport panel cannot settle out of a scale
          // without showing the page behind its own edges on the way in, so the
          // push-in lives on the image below instead.
          'transition-opacity duration-1000',
          EASE,
          here ? 'opacity-100' : 'opacity-0',
        )}
      >
        {BEATS.map((beat, i) => (
          <img
            // Keyed on the beat *and* the active index, so the incoming frame is
            // a fresh element and `panel-up` replays on it. Keyed on the beat
            // alone the animation would run once, at mount, and never again.
            key={`${beat.id}-${i === active}`}
            src={beat.image}
            // Only the picture on show is described. The other is mounted for
            // the swap, not for reading.
            alt={i === active ? beat.alt : ''}
            aria-hidden={i !== active}
            // Both eager, and the second one deliberately. `lazy` on the partner
            // is right when there are nine of them behind one plate, as on the app
            // fold; here there are two, one of them is on a five-second clock, and
            // a partner that has not been fetched turns the first swap into a
            // panel climbing in empty. `fetchpriority="low"` is what makes that
            // affordable: it lands, but behind everything above it on the page.
            loading="eager"
            fetchPriority={i === 0 ? 'auto' : 'low'}
            decoding="async"
            className={cn(
              // Five percent right of centre. What is left to crop after the
              // panel was widened is a few percent a side, and the charger sits
              // nearer the right edge than the bike's tail does the left, so the
              // window leans the way the subject does.
              'absolute inset-0 size-full object-cover object-[55%_50%]',
              // The new frame climbs in from under the panel's bottom edge and
              // covers the one already there, which stays where it is. A
              // crossfade was the first build and it was the wrong figure: these
              // are two different places, and dissolving one into the other says
              // they are the same place at two moments. A frame arriving over the
              // top of another says next.
              //
              // Nothing has to be moved back afterwards, which is the reason it
              // is built this way round: the outgoing frame never leaves its
              // position, so there is no third state to reset and no direction to
              // remember. Stacking order is the whole mechanism.
              i === active ? 'z-10 animate-panel-up' : 'z-0',
            )}
          />
        ))}
      </div>

      {/* ── The type ───────────────────────────────────────────────────────
          Its own gutter rather than the site's Container: the copy is bled to the
          left of the window the way the picture is bled to the right, and it stops
          short of the seam by the same measure it starts short of the edge. See
          the note at the top of this file. */}
      <div className="px-4 sm:px-6">
        {/* The vertical padding is load-bearing, not taste. This column sets the
            fold's height, the panel is `inset-y-0` inside it, and the panel's
            height is what decides how much of each photograph survives the crop.
            At py-28 the column came out 160px taller than the 88svh floor and took
            the panel to 0.92 wide against frames that are 1.25. */}
        {/* One block, centred in the column. `justify-between` held this first,
            claim at the top and story at the bottom, and it put three hundred
            pixels of nothing through the middle of the fold: not the loaded
            emptiness the battery fold's left third has, which has a photograph
            running behind it, but a hole between two things that belong to each
            other. Centred, the slack falls above and below where it reads as
            margin, and the claim and the story it introduces stay one object. */}
        <div className="flex flex-col justify-center py-16 sm:py-20 lg:min-h-[92svh] lg:w-[45%] lg:py-16 lg:pl-6 lg:pr-10 xl:w-[42%] xl:pl-14 xl:pr-14">
          {/* A step under the display size the folds above use, and the column is
              why: they set theirs against half of a 72rem container, this one has
              42% of the window and a photograph taking the rest. At their
              clamp(2.5rem,5vw,3.75rem) the sentence broke to four lines here,
              which pushed the column past the fold's floor and cost the photograph
              a seventh of its width to the crop. Same voice, one size down.

              "not a station" takes the red: the whole point of a bike that charges
              off a wall is that the infrastructure argument does not apply to it,
              and that phrase is the argument. */}
          <h2
            className={cn(
              'font-display text-[clamp(2.25rem,3.2vw,3rem)] leading-[1.04] font-bold tracking-[-0.035em] text-ink-900 text-balance',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            Charging is a socket, <span className="text-brand-600">not a station</span>
          </h2>

          {/* The beat and its controls, under one rule. The hairline is the seam
              between what the fold claims and what the two photographs answer
              with: everything above it holds still, everything below it changes.
              It is the same rule the folds above use to separate a heading from a
              rail, at the same weight. */}
          <div className="mt-8 border-t border-ink-900/12 pt-8 sm:mt-10 sm:pt-10">
            {/* Keyed on the beat so React remounts the block and `rise` replays
                on every swap. Polite and atomic: worth announcing, never worth
                cutting off, and read as one statement rather than three fragments
                arriving separately. */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className={cn('transition-opacity duration-700', EASE, here ? 'opacity-100' : 'opacity-0')}
              style={{ transitionDelay: here ? '160ms' : '0ms' }}
            >
              <div key={current.id} className="animate-rise">
                <h3 className="font-display text-2xl leading-[1.15] font-bold tracking-[-0.025em] text-ink-900 text-balance sm:text-[1.75rem]">
                  {current.headline}
                </h3>

                <p className="mt-4 max-w-[48ch] text-base leading-[1.7] text-ink-800/80 text-pretty sm:text-lg">
                  {current.body}
                </p>

                {/* One figure per beat, not a rail of five. The battery fold
                    above already owns the rail, and this is the single number the
                    beat turns on.

                    Label over value, which is the treatment that fold uses for
                    all five of its figures. Set on one line instead, with the
                    caption trailing the number, it read as a footnote nudged up
                    against a headline: two type sizes and two weights fighting
                    over one baseline, and a caption that has to be short enough
                    not to wrap under a number. Stacked, the label can say what it
                    needs to and the number gets to be the loudest thing in the
                    block, which is the point of quoting it. */}
                <dl className="mt-7">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                    {current.figure}
                  </dt>
                  <dd className="mt-2 font-display text-[2.25rem] leading-none font-bold tabular-nums tracking-[-0.03em] text-ink-900">
                    {current.value}
                  </dd>
                </dl>
              </div>
            </div>

            {/* ── The controls, which are also the clock ────────────────────
                A toggle group rather than a tablist: the panel these switch is
                the photograph outside this element, and faking the role with
                `aria-owns` would be a worse lie than not claiming it. Pressed
                buttons plus the live region above say what this is. */}
            <div
              role="group"
              aria-label="Charging"
              onKeyDown={onKeyDown}
              className={cn(
                'mt-10 grid max-w-md grid-cols-2 gap-x-6 sm:gap-x-8',
                'transition-[transform,opacity] duration-700',
                EASE,
                here ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: here ? '280ms' : '0ms' }}
            >
              {BEATS.map((beat, i) => {
                const selected = i === active

                return (
                  <button
                    key={beat.id}
                    type="button"
                    aria-pressed={selected}
                    aria-controls="charging-frame"
                    onClick={() => setActive(i)}
                    className={cn(
                      'group pt-4 text-left',
                      'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                    )}
                  >
                    <span
                      className={cn(
                        'block font-display text-base font-bold tracking-[-0.01em] sm:text-lg',
                        'transition-colors duration-500',
                        EASE,
                        // ink-500 on white is 5.30:1. Unselected, but these are
                        // controls rather than decoration, so they stay above the
                        // body-text bar.
                        selected ? 'text-ink-900' : 'text-ink-500 group-hover:text-ink-900',
                      )}
                    >
                      {beat.label}
                    </span>

                    {/* The track, and the meter on it. The fill runs on `scaleX`,
                        composited, so the dwell costs no layout on any frame.
                        Remounted with the active beat, which is what restarts the
                        keyframe. */}
                    <span
                      aria-hidden="true"
                      className="mt-4 block h-px w-full overflow-hidden bg-ink-900/15"
                    >
                      <span
                        key={active}
                        onAnimationEnd={selected ? () => go(active + 1) : undefined}
                        className={cn(
                          'block h-px origin-left bg-brand-600',
                          // Full on the selected beat whenever the meter is not
                          // running, which is the reduced-motion state: the rule
                          // marks where you are instead of how long is left.
                          selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[0.15]',
                          !selected && cn('transition-transform duration-500', EASE),
                        )}
                        style={
                          selected && running
                            ? {
                                animationName: 'meter',
                                animationDuration: `${DWELL}ms`,
                                animationTimingFunction: 'linear',
                                animationFillMode: 'both',
                                animationPlayState: paused ? 'paused' : 'running',
                              }
                            : undefined
                        }
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
