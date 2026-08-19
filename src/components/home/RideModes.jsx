import { useCallback, useEffect, useRef, useState } from 'react'
import { getLenis } from '@/utils/lenis'
import { cn } from '@/utils/cn'
import { FLAGSHIP } from '@/data/motorcycles'

/**
 * One frame, two claims: what you cannot change on the left, what you can on the
 * right.
 *
 * The split is the argument. The left block is fixed hardware, single speed and
 * no clutch, and there is nothing to decide. The right is the only thing you do
 * decide, which is how much of the motor you want today.
 *
 * The two halves used to be separated by a diagonal hairline across the plate,
 * with a graded wedge behind its left side. Both are gone: the film is left
 * whole and the split is carried by the placement of the type alone, one block
 * into each corner.
 *
 * What holds the type over the picture is two corner scrims, bottom left and top
 * right. The frame is a high-key daylight plate and white type has to beat a
 * bright sky in the top right corner. Corner-anchored radial washes rather than
 * one flat scrim, so the middle of the photograph, where the bike is, keeps its
 * contrast.
 *
 * The film opens rather than simply being there. Approaching the fold it is a
 * window held back from the edges — inset 7% and 9%, round-cornered, black around
 * it — and as the fold crosses the screen that window opens to full bleed while
 * the picture inside it grows 6%. Both are scrubbed off the scroll position, so
 * the film is arriving for exactly as long as the visitor is arriving, and it is
 * open by the time the fold is centred. It does not close again on the way out.
 *
 * The type waits for the window. Both blocks are held off until the open is about
 * two thirds through and then rise in on their own stagger, so the shut state is a
 * film frame on black and nothing else — type set over a window that has not
 * opened yet lands half on the picture and half off its edge, which reads as a
 * mistake rather than as a frame.
 *
 * The film also runs only while the fold is on screen. A 27-second loop left
 * playing three screens away decodes every frame for nobody.
 *
 * The push-in this replaced was a one-shot transition fired by the entrance
 * observer, which meant it was over before most visitors had the fold in front of
 * them.
 *
 * Below `lg` they come off. Two blocks of type in opposite corners of 390px have
 * nowhere to go, so the photograph becomes a flat background under one flat
 * scrim with the two blocks stacked on it in reading order.
 *
 * This fold is dark, and what follows it is the white FAQ rather than the footer's
 * own black — so the alternation the charging fold above was built to protect is
 * kept by the section under this one, not by this one's bottom edge. It would
 * survive either way: this fold is a photograph and the footer is flat #050505, so
 * the plate's own edge reads as the seam. A second flat-black slab in this slot
 * would have fused with it.
 *
 * THE FILM IS A CUT, NOT THE MASTER. The master is `RV_BlazeX.mp4`, the BlazeX
 * commercial: 27 seconds, 1920x1080, 19.5 Mbps, 66MB, with an audio track and
 * with the ad's own headlines burned into the picture — "BOLD DESIGN", "TWO
 * STRIKING COLORS", "EXHILARATION REDEFINED", "UNMATCHED PERFORMANCE", "THE
 * FUTURE IS ELECTRIC". Two of those land in the top right corner, which is where
 * this section's own heading sits, and none of them can be masked out of a
 * moving frame. Several shots are also letterboxed, which would have put black
 * bars inside the plate.
 *
 * So the loop is the two windows of the master that carry no burned-in type and
 * no letterbox, spliced with a hard cut. The master is cut-heavy already, so the
 * splice reads as one more cut:
 *   ffmpeg -i RV_BlazeX.mp4 -filter_complex \
 *     "[0:v]trim=13:15.9,setpts=PTS-STARTPTS,scale=1600:-2[a];\
 *      [0:v]trim=17.5:20.9,setpts=PTS-STARTPTS,scale=1600:-2[b];\
 *      [a][b]concat=n=2:v=1[o]" -map "[o]" -an \
 *     -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
 *     -movflags +faststart public/videos/rv-blazex.mp4
 * 66MB to 3MB, and silent: `-an` is not an optimisation here but the point, since
 * nothing on this site plays sound. If the master is ever replaced, re-run the
 * scan for burned-in type before trusting a window:
 *   ffmpeg -i <master> -vf "fps=1,scale=340:-2,tile=7x4" -frames:v 1 scan.jpg
 *
 * One honest caveat about the content, for whoever reads this next: the bike in
 * the film is the BlazeX, and the catalogue this site sells from is the RV400,
 * the RV400 BRZ and the RV1. The claims either side of the line are true of those
 * bikes, and the footage is a Revolt film, but it is not footage of the bikes
 * named on this page.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const BIKE = FLAGSHIP
const TOP_SPEED = BIKE.specs.topSpeed

// The three the catalogue lists for the flagship, in the order the throttle
// gives them to you. No figures against them on purpose: the honest per-mode
// range is a band that depends on the hill, and three invented numbers in a row
// would read as a spec sheet the company never published.
const MODES = [
  { id: 'eco', name: 'Eco', gloss: 'The longest way round' },
  { id: 'normal', name: 'Normal', gloss: 'Most days, most roads' },
  { id: 'sport', name: 'Sport', gloss: 'Everything the motor has' },
]

// How far in the film's window is held before it opens, and the corner radius it
// carries while it is inset. Percentages of the fold, so the shut state keeps its
// proportions from a phone to a 2560 window; the radius is the one absolute, since
// a corner is a corner at any size.
//
// 7 and 9 rather than a square inset: the fold is wider than it is tall, so equal
// percentages would take far more off the sides than the top and read as a
// letterbox rather than a window held back from the edges.
const SHUT_INSET_Y = 7
const SHUT_INSET_X = 9
const SHUT_RADIUS = 26

// The window opens over the middle of the pass, not the whole of it, and it
// stays open after — this is an arrival, and an arrival that closed itself
// again on the way out would ask to be watched twice.
//
// The slice was 0.16 to 0.5, a third of the pass, and the move was over almost
// as soon as it had started: the same distance travelled in half the scroll
// reads as a snap with a wheel behind it rather than a window opening. Half the
// pass gives the move room to be watched.
const OPEN_FROM = 0.12
const OPEN_TO = 0.64

// The film's own scale across the same move. It grows as the window opens, so the
// picture is coming toward you rather than merely being uncovered, and it holds a
// little over 1 at rest so the plate's edges can never be exposed by a rounding
// error in the clip.
const ZOOM_SHUT = 1.0
const ZOOM_OPEN = 1.06

// The type follows the film rather than the fold: it is held off until the window
// is most of the way open, then arrives over a picture that has finished moving.
// 0.62 rather than 1, so the last of the open and the first of the type overlap
// slightly and the fold reads as one arrival instead of two.
const TYPE_AT = 0.62

export default function RideModes() {
  // No `useReveal` here, unlike the folds above: everything in this one is a
  // function of how far the fold has crossed the window, which a latch cannot
  // answer.
  const ref = useRef(null)
  const [unwatched, setUnwatched] = useState(false)
  const [still, setStill] = useState(false)
  // Whether the fold is on screen at all. The film should be running only while it
  // is being watched, so this is the live answer and not a latch.
  const [onScreen, setOnScreen] = useState(false)
  // 0 is the held-back window, 1 is full bleed. Everything the film does across
  // the scroll is a function of this one number — and it is a ref, not state,
  // because it changes on every frame of a scroll.
  //
  // It was state, and that was the other half of the roughness: a `setState` per
  // frame re-rendered the whole fold — the film, the mount, the headline, the
  // figure, three mode rows — sixty times a second, to change two strings on one
  // element. React's reconciliation then landed in the same main-thread frame as
  // Lenis's own scroll work, and what came out was a window that opened in
  // steps. `paint` writes the two properties straight to the element instead.
  // Both are composited, so nothing here lays the page out.
  const open = useRef(0)
  const videoRef = useRef(null)

  // The one thing the scrub still tells React about: whether the type has been
  // let in. A boolean that flips once, rather than a number that changes every
  // frame.
  const [typed, setTyped] = useState(false)

  const paint = useCallback((value) => {
    open.current = value

    const video = videoRef.current
    if (video) {
      const shut = 1 - value
      video.style.clipPath = `inset(${SHUT_INSET_Y * shut}% ${SHUT_INSET_X * shut}% round ${SHUT_RADIUS * shut}px)`
      video.style.transform = `scale(${ZOOM_SHUT + (ZOOM_OPEN - ZOOM_SHUT) * value})`
    }

    // Threshold, not value: this is the only re-render the scroll can cause, and
    // it happens twice across the whole pass.
    setTyped((was) => (value >= TYPE_AT) !== was ? value >= TYPE_AT : was)
  }, [])

  // An observer on a page nobody is looking at never fires, and everything in
  // this fold is gated behind the entrance, so a background tab or a headless
  // renderer would take the section away rather than just its arrival. Same
  // guard as the three folds above it.
  useEffect(() => {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') return

    setUnwatched(true)
  }, [])

  // `autoPlay` ignores the OS motion setting, so it is read here instead: reduced
  // motion holds the film on its poster, which is the first frame of the loop.
  // CSS can only stop transitions. Same read as the battery fold.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setStill(query.matches)

    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // The live in-view flag, for the film's own transport and for the scrub. The
  // margin starts both a little before the fold's edge reaches the window, so the
  // first frame is decoded and the scrub has taken its first measurement before
  // any of it is visible.
  useEffect(() => {
    const node = ref.current
    if (!node) return

    // No observer (older browsers, some headless renderers) means neither the
    // transport nor the scrub would ever start and the fold would ship as a still
    // frame behind no type at all. Hand it the finished state instead.
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true)
      paint(1)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '15% 0px 15% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [paint])

  // Nothing is fetched until the fold is reached: `preload="none"` and a poster,
  // so the 3MB only lands for visitors who scroll to the bottom of the page, and
  // never for those who asked for less motion.
  //
  // It is also paused again on the way out. A 27-second loop left running under
  // three screens of other content decodes every frame for nobody, which on a
  // phone is heat and battery; and coming back to the fold should start the film
  // near where it opened rather than wherever it happened to have wandered to.
  useEffect(() => {
    const video = videoRef.current
    if (!video || still) return

    if (onScreen || unwatched) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [onScreen, unwatched, still])

  // A page nobody is looking at gets the film open rather than held shut: a
  // headless renderer or a background tab would otherwise screenshot the fold
  // mid-arrival, with a window that never opens because no scroll ever happens.
  // Handled with the reduced-motion case, further down, where `paint` is the
  // single writer.

  // The scrub, driven off the scroll position rather than a scroll-linked CSS
  // animation: `animation-timeline: view()` is still Chromium-only, and this is the
  // fold's one piece of continuous motion — a Safari visitor would get a window that
  // never opened at all.
  //
  // Progress runs 0 when the fold's top edge is at the bottom of the window to 1
  // when its bottom edge has reached the top, and the open is a slice out of the
  // middle of that. Only mounted while the fold is on screen: off screen there is
  // nothing to scrub and the listener is the sort that stays on a page for the
  // rest of its life.
  //
  // NOTHING IN THE FRAME LOOP READS LAYOUT. The geometry — where the fold starts in
  // the document, how tall it is, how tall the window is — is measured once here and
  // again on resize, and the per-frame work is then arithmetic on a cached number
  // and one `scrollY`. The first version called `getBoundingClientRect` inside the
  // loop, which forces a synchronous layout on every frame it runs; under Lenis the
  // scroll position is itself main-thread work, so that read landed in the middle of
  // the ease and came out as a stutter in the scroll rather than in the film.
  useEffect(() => {
    const node = ref.current
    if (!node || !onScreen || still) return

    let frame = 0
    let top = 0
    let span = 1

    const remeasure = () => {
      const rect = node.getBoundingClientRect()
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0
      const view = window.innerHeight || 1

      top = rect.top + scrolled
      // The distance the fold travels between those two positions. Never 0, so
      // there is no divide to guard.
      span = rect.height + view
    }

    const measure = () => {
      frame = 0

      const scrolled = window.scrollY || document.documentElement.scrollTop || 0
      const view = window.innerHeight || 1
      // `top - scrolled` is what `rect.top` would have been, without asking the
      // browser to lay the page out to find it.
      const progress = Math.min(Math.max((view - (top - scrolled)) / span, 0), 1)
      const t = Math.min(Math.max((progress - OPEN_FROM) / (OPEN_TO - OPEN_FROM), 0), 1)

      // Eased rather than linear, and eased at this end rather than in CSS: a
      // transition cannot ease a value that is being set every frame.
      //
      // Smootherstep, not the cubic ease-out this ran before. An ease-out leaves
      // at full speed, which on a scrubbed value means the window jumps the
      // moment the fold crosses `OPEN_FROM` — the wheel is turning at a constant
      // rate and the picture is not. Smootherstep is flat at both ends, so the
      // open grows out of the scroll and settles back into it, and there is no
      // frame where the film's speed and the page's disagree.
      paint(t * t * t * (t * (t * 6 - 15) + 10))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    // A resize moves the fold and changes its height, so the cache is rebuilt before
    // the frame that follows. `ResizeObserver` on the section itself rather than only
    // a window `resize` listener: the copy above this fold rewraps as the window
    // narrows, which moves this section down the document without the window ever
    // being resized in a way a single listener would catch late.
    const invalidate = () => {
      remeasure()
      onScroll()
    }

    const resize = new ResizeObserver(invalidate)
    resize.observe(node)

    remeasure()
    measure()

    // Lenis's own event as well as the native one. Lenis does move the real
    // document, so `scroll` fires — but only once per committed position, which
    // drops frames in the middle of its ease and would show up here as a window
    // that opens in steps. Its own event fires every frame of the ease. The native
    // listener stays for reduced-motion visitors and for anything that scrolls the
    // page without going through Lenis at all, such as a keyboard or a hash jump.
    const lenis = getLenis()

    lenis?.on('scroll', onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', invalidate)

    return () => {
      lenis?.off('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', invalidate)
      resize.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [onScreen, still])

  // Reduced motion gets the fold at its destination: full bleed, no scrub, no
  // scale. What the scroll was driving is a piece of motion, and asking for less
  // of it should not cost the film the width it was cut for.
  //
  // Painted from an effect rather than in the JSX, so React and the frame loop
  // are never both writing the same two properties — the loop owns them while
  // the fold is being scrolled past, and this owns them when there is no scroll
  // to own them.
  useEffect(() => {
    if (still || unwatched) paint(1)
  }, [still, unwatched, paint])

  // The type's own gate. Under reduced motion and on an unwatched page the film
  // is already open, so the type is simply there.
  const here = typed || still || unwatched

  return (
    <section
      ref={ref}
      id="ride-modes"
      className="relative isolate flex min-h-[38rem] items-stretch overflow-hidden bg-ink-950 text-white lg:min-h-[88svh]"
    >
      {/* ── The plate ─────────────────────────────────────────────────────── */}
      {/* Out of `public/` rather than imported, which is where this repo keeps
          film: the hero and the battery fold read theirs from the same place, and
          a 3MB asset does not want to go through the bundler to gain a hash.

          Centred, unlike the still that held this slot: the subject is mid-frame
          in every shot of the loop, so there is no dead side worth cropping
          toward. Silent and wordless, so it carries no dialogue to caption and
          stands in for a photograph, which is what `role="img"` says. */}
      <video
        ref={videoRef}
        src="/videos/rv-blazex.mp4"
        poster="/videos/rv-blazex-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        role="img"
        // Not "Kathmandu": the footage is the Indian film, and the label should
        // not claim a city the frames do not show.
        aria-label="A Revolt ridden at first light, seen from the saddle and from the road"
        className="absolute inset-0 -z-20 size-full object-cover object-center"
        // The film is laid out full-bleed at every scroll position and it is the
        // *window onto it* that opens: `clip-path` rather than a width, a margin or
        // an `inset`, none of which an element can change 60 times a second without
        // laying the fold out again, and all of which would re-crop `object-cover`
        // on every frame. A clip is composited, so the picture behind it never
        // moves or reflows — it is only revealed further.
        //
        // No transition on either value: both are already functions of the scroll
        // position, and easing something that is set every frame only makes it lag
        // the wheel. The easing is in the scrub instead.
        //
        // The clip and the scale are not written here. `paint` owns them, and a
        // second writer would mean React resetting the element to a stale value
        // on any unrelated re-render, mid-scroll. The shut state below is the
        // first frame's worth only, before the scrub has run once.
        style={{
          clipPath: `inset(${SHUT_INSET_Y}% ${SHUT_INSET_X}% round ${SHUT_RADIUS}px)`,
          willChange: still ? undefined : 'clip-path, transform',
        }}
      />

      {/* ── The mount ─────────────────────────────────────────────────────── */}
      {/* Two 22px black bars, top and bottom. This was the section's `border-y`
          first, which was wrong for one reason: `overflow-hidden` clips at the
          padding box, so the hairline stopped dead at the band instead of running
          through it. As bars they are inside the clip with the line painted over
          them, which is the whole point of the cut reaching the edge of the fold.

          They also overlay the plate now rather than shrinking it, so the
          photograph keeps the full 88svh and the bands are laid across its top and
          bottom edges. The band walked 2, 8, 16, 28 and back to 22: at 2px it read
          as an artefact of the junction rather than a decision about it, and at 28
          it started competing with the plate.

          The top one does the work. The fold before this is white on the left and
          a photograph on the right, so without it the two plates butt straight
          into each other and the junction reads as a rendering seam rather than a
          section ending. The bottom one lands on the footer's own black and is
          invisible there; it stays for the day the footer is not black. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-0 h-[22px] bg-ink-950" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-0 h-[22px] bg-ink-950" />

      {/* The scrims. Two corners at `lg`, one flat wash below it, where the type
          is stacked over the middle of the frame instead of tucked into its
          corners. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-ink-950/70 lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{
          backgroundImage:
            'radial-gradient(60% 55% at 8% 100%, rgba(5,5,5,0.88), rgba(5,5,5,0) 72%), radial-gradient(45% 45% at 100% 0%, rgba(5,5,5,0.82), rgba(5,5,5,0) 70%)',
        }}
      />

      {/* ── The type ──────────────────────────────────────────────────────── */}
      {/* One grid, two cells, each in the corner its scrim is under.
          Thirty/seventy rather than half and half: the left block is a heading, a
          figure and a paragraph and the right one is three short rows, so an even
          split would have set the paragraph much wider than the modes list and
          pulled the right block away from the corner its scrim is under. A
          percentage keeps both proportional as the window grows. */}
      {/* `z-20`, over the bars: they are decoration and the type is not, so if the
          two ever meet the type wins. The extra
          vertical padding at `lg` is the bars' own thickness handed back, so the
          blocks keep their distance from the top and bottom edges of the fold
          rather than sitting against a black band. */}
      <div className="relative z-20 grid w-full grid-cols-1 gap-y-16 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[30%_1fr] lg:gap-x-16 lg:px-12 lg:py-[4.5rem] xl:px-16">
        {/* The fixed half. It reads first on a phone, and at `lg` it sits in the
            bottom left corner, under that scrim. */}
        <div className="flex flex-col justify-end lg:col-start-1 lg:row-start-1">
          <h2
            className={cn(
              'font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.98] font-extrabold uppercase tracking-[-0.02em]',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            Nothing
            <br />
            to shift
          </h2>

          {/* The figure, and it is a nought on purpose. Every other number on
              this page is something the bike has; this is the one that counts
              what it does without. Baseline-aligned with a two-line label the way
              the battery fold pairs its own values and labels. */}
          <div
            className={cn(
              'mt-7 flex items-center gap-4',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: here ? '120ms' : '0ms' }}
          >
            <span className="font-display text-[4.5rem] leading-[0.8] font-extrabold tabular-nums text-brand-500 sm:text-[5.5rem]">
              0
            </span>
            <span className="text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.18em] text-white/70">
              Gears to change
              <br />
              No clutch, no stalls
            </span>
          </div>

          <p
            className={cn(
              'mt-7 max-w-[46ch] text-base leading-[1.7] text-white/80 text-pretty sm:text-lg',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: here ? '200ms' : '0ms' }}
          >
            One twist takes it from a standstill to {TOP_SPEED}. There is no
            clutch to slip and no first gear to find, which is most of what makes
            a Kathmandu traffic light tiring.
          </p>
        </div>

        {/* The half you choose. Right-aligned at `lg` so the block sits into the
            corner its scrim is under, left-aligned on a phone where it is simply
            the second thing on the page. */}
        <div className="lg:col-start-2 lg:row-start-1 lg:justify-self-end lg:text-right">
          <h3
            className={cn(
              'font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-[0.98] font-extrabold uppercase tracking-[-0.02em]',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
            style={{ transitionDelay: here ? '120ms' : '0ms' }}
          >
            Ride
            <br className="hidden lg:block" /> modes
          </h3>

          {/* Three rows, one rule above each. Not chips: a pill round a word that
              cannot be clicked is a button that does nothing, and these are the
              names of three states of the throttle, not controls. The mode leads
              and the gloss follows it under the same rule. */}
          <dl className="mt-7 max-w-xs lg:ml-auto">
            {MODES.map((mode, i) => (
              <div
                key={mode.id}
                className={cn(
                  'border-t border-white/15 py-4',
                  'transition-[transform,opacity] duration-700',
                  EASE,
                  here ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                )}
                style={{ transitionDelay: here ? `${220 + i * 90}ms` : '0ms' }}
              >
                <dt className="font-display text-xl font-bold uppercase tracking-[0.02em] text-white sm:text-2xl">
                  {mode.name}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/65">
                  {mode.gloss}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
