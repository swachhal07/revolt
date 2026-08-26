import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '@/components/ui/Container'
import { ChevronRight } from '@/components/ui/icons'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useLineup } from '@/hooks/useCollection'
import { MOTORCYCLES, splitLineup } from '@/data/motorcycles'
import { cn } from '@/utils/cn'

/**
 * The lineup, straight under the hero: every model side by side on white so
 * the bikes carry the fold and nothing else competes with them.
 *
 * Two bands, not one. The RVX and the RV BlazeX are the machines the showroom
 * leads on, so they get a row of their own at the top — two columns rather than
 * three, which is the whole promotion: at that width each bike is roughly half
 * again the size of one in the rail below, and a reader arriving at this section
 * meets them before anything else. The rest of the catalogue follows in the
 * scrolling rail underneath, at the size it always was.
 *
 * No badge and no "featured" ribbon marks the top row. Position and size are the
 * hierarchy; a label saying so would be the layout explaining itself.
 *
 * Equal columns are the most generic shape a feature row can take, so the
 * differentiation is all in the detail — no badges, no rules, and a cast shadow
 * under each cutout so it does not read as pasted on. The columns
 * align across, not just down. The surface stays plain white; the bikes are the
 * only texture the section gets. Specs and price live on the detail pages.
 *
 * White, not the hero's black. The cutouts are shot on white, so a dark
 * surface would ring every bike with a grey halo.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/**
 * `EASE` as a function, for the one thing on this page a CSS transition cannot
 * drive: a scroll offset. Same four control points, so the rail moves on the
 * curve everything around it moves on.
 *
 * Solved rather than approximated. `x` and `y` are separate cubics of the
 * parameter `t`, so progress along the curve is not progress along the
 * timeline — Newton-Raphson recovers `t` from elapsed time, five iterations
 * being far more than a monotonic curve of this shape needs.
 */
const bezier = (x1, y1, x2, y2) => {
  const a = (u, v) => 1 - 3 * v + 3 * u
  const b = (u, v) => 3 * v - 6 * u
  const at = (t, u, v) => ((a(u, v) * t + b(u, v)) * t + 3 * u) * t
  const slope = (t, u, v) => 3 * a(u, v) * t * t + 2 * b(u, v) * t + 3 * u

  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1

    let t = x
    for (let i = 0; i < 5; i += 1) {
      const d = slope(t, x1, x2)
      if (d === 0) break
      t -= (at(t, x1, x2) - x) / d
    }

    return at(t, y1, y2)
  }
}

const ease = bezier(0.32, 0.72, 0, 1)

/**
 * One model, as it appears anywhere in this section. Both bands render this —
 * the hero row and the rail — because the card is the same object in both; only
 * the column it sits in and the type size change. Two copies of this markup was
 * the alternative, and the two would have drifted the first time one was edited.
 *
 * `featured` scales the name rather than decorating the card. In the top row the
 * column is half the width of the section instead of a third, so a name set at
 * the rail's size would look small in it — the type follows the column.
 *
 * `eager` is passed rather than inferred from an index: the first bike on the
 * page is the one worth fetching immediately, and after the split that is the
 * first hero, not the first bike in the catalogue.
 */
function BikeCard({ bike, eager = false, featured = false, className }) {
  return (
    // Columns land left to right rather than all at once — the stagger comes
    // from the group, so document order is the only thing setting it.
    <article data-reveal="32" className={cn('group flex flex-col', className)}>
      {/* Name over class, both centred. The class sat hard right for a while
          and at this column width it drifted closer to the next bike's name
          than to its own. No rule and no badge here — the spacing does the
          separating. */}
      <div className="flex flex-col items-center gap-2.5 pb-4 text-center">
        <h3
          className={cn(
            'font-display font-bold tracking-[0.02em] text-ink-900',
            featured
              ? 'text-[1.75rem] sm:text-[2.125rem] lg:text-[2.5rem]'
              : 'text-2xl sm:text-[1.75rem]',
          )}
        >
          {bike.name}
        </h3>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-ink-500">
          {bike.class}
        </span>
      </div>

      {/* Fixed aspect so bikes of different lengths still share a baseline and
          the row never goes ragged. The photograph is taken out of flow below:
          `aspect-ratio` only sets a preferred height, so an in-flow image
          taller than the ratio stretches its own box and drops that column out
          of alignment with the ones beside it — and lazy neighbours would do it
          on load. */}
      <div className={cn('relative w-full aspect-4/3', featured ? 'mt-8 sm:mt-10' : 'mt-10')}>
        {/* Cast shadow. Without it the cutout floats — and it is tinted with
            the ink hue rather than pure black. */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute bottom-[8%] left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[50%]',
            'bg-ink-900/15 blur-xl',
            'transition-[transform,opacity] duration-500',
            EASE,
            'group-hover:scale-x-105 group-hover:opacity-70',
          )}
        />
        <img
          src={bike.studio}
          // The tagline is the description when there is one; a bike still
          // waiting on its copy gets its class instead, rather than an alt
          // ending in an em dash and nothing.
          alt={bike.tagline ? `${bike.name} — ${bike.tagline}` : `${bike.name}, ${bike.class}`}
          loading={eager ? 'eager' : 'lazy'}
          className={cn(
            'absolute inset-0 size-full object-contain',
            'transition-transform duration-500',
            EASE,
            // Lifts off its shadow rather than just scaling up.
            'group-hover:-translate-y-2',
          )}
        />
      </div>

      {/* Opens the model's own page. This was an inert <span> for a while — it
          had been a link, was stood down when the detail route was not ready,
          and kept its underline and its hover the whole time. A thing that is
          underlined, animates on hover and reads "Configure ›" is a link as far
          as anybody looking at it is concerned, so the honest options were to
          make it navigate or to stop drawing it like that. It navigates.

          The card is not itself a link, so there is nothing to nest inside
          here. `stopPropagation` is not needed for the same reason.

          Its own focus ring, now that it takes a tab stop again: the hover
          state is a `group-hover` driven by the card, which a keyboard never
          triggers, so without this the control could be focused with no
          indication of it. */}
      <Link
        to={`/motorcycles/${bike.slug}`}
        className={cn(
          'mt-8 inline-flex items-center gap-2 self-center text-xs font-semibold tracking-[0.16em] uppercase',
          'text-ink-900 underline decoration-ink-900/25 decoration-1 underline-offset-[7px]',
          'transition-colors duration-300',
          EASE,
          'group-hover:text-brand-600 group-hover:decoration-brand-600',
          'hover:text-brand-600 hover:decoration-brand-600',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
        )}
      >
        {/* The model name is in the card above, but a screen reader reading the
            links on this page hears "Configure" six times over with nothing to
            tell them apart. */}
        Configure
        <span className="sr-only"> the {bike.name}</span>
        <ChevronRight
          className={cn('size-3 transition-transform duration-300', EASE, 'group-hover:translate-x-1')}
        />
      </Link>
    </article>
  )
}

// How many rules the indicator shows at once, regardless of how long the
// lineup gets. Three is the number of bikes on screen above `lg`, so the
// indicator reads as a window on the row rather than a count of the catalogue.
const WINDOW = 3

// How long the rail rests on a position before walking to the next one. Longer
// than the charging fold's beat: that one swaps a block of copy a reader is
// either reading or not, this one moves photographs under a heading, and a rail
// that shifts every three seconds reads as restless rather than alive.
const DWELL = 4500

export default function FeaturedBikes() {
  // The heading and then the columns, left to right — see [[useScrollReveal]].
  const ref = useScrollReveal()
  const trackRef = useRef(null)

  // The catalogue the back office holds, falling back to the bundled one, split
  // into the two bands by slug — see [[splitLineup]]. A model added in the admin
  // arrives in `rest`, which is the rail; nothing promotes itself to the top row.
  //
  // The store answers a frame or two after mount, so this list can change once
  // under a laid-out rail. Everything downstream is keyed to it: the cards are
  // memoised on `rest`, and `readGeometry` counts it — so the stop positions and
  // the indicator are re-derived when it swaps rather than describing the
  // catalogue that was there a moment ago.
  const { bikes } = useLineup(MOTORCYCLES)
  const { heroes, rest } = useMemo(() => splitLineup(bikes), [bikes])
  // Where the rail is, counted in stopping positions rather than in bikes.
  // The distinction is the whole indicator: with three bikes on screen the
  // leftmost one can only ever be the first of four, so a mark that tracked
  // bikes could never reach the last two rules and stalled a rule short of the
  // end. Six bikes three-up is four positions, and the last of them is the end
  // of the rail.
  //
  // Read off the scroll offset rather than held as the source of truth, so a
  // native flick, a trackpad and a drag all report the same place without any
  // of them having to say so.
  const [rail, setRail] = useState({ active: 0, positions: 1 })

  // ── Geometry, measured once per layout ─────────────────────────────────
  // The column is three different widths across the breakpoints and the gap is
  // three more, so none of this can be hardcoded — but none of it changes while
  // the reader is scrolling either. It is read when the layout changes and
  // cached, because the alternative is a `getComputedStyle` and a forced layout
  // on every scroll event, and a trackpad swipe fires those continuously.
  const geometry = useRef(null)

  const readGeometry = useCallback(() => {
    const track = trackRef.current
    const column = track?.firstElementChild?.getBoundingClientRect().width ?? 0
    if (!track || !column) return null

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    const pitch = column + gap
    // Three above `lg`, one on a phone. What the arrows move by.
    const perView = Math.max(1, Math.round(track.clientWidth / pitch))

    geometry.current = {
      pitch,
      perView,
      // The rail carries the non-hero models only — the two heroes are in the
      // grid above and never scroll — so this counts that list, not the whole
      // catalogue. Counting all six here would give the indicator two positions
      // the rail cannot reach and leave the clock walking into dead travel.
      positions: Math.max(1, rest.length - perView + 1),
    }
    return geometry.current
  }, [rest.length])

  // The scroll handler, and so the hottest path in the section: arithmetic on a
  // cached pitch and nothing else.
  //
  // The bail-out is the point. `active` only changes when the rail crosses a
  // position boundary, which is a handful of times per gesture, but scroll fires
  // on every frame of one. Returning `prev` unchanged is what stops React
  // re-rendering the row sixty times a second to produce the same markup — and
  // rebuilding six cards means thirty `cn()` calls, each of them a tailwind-merge
  // parse. Allocating a fresh `{ active, positions }` here, equal to the last one
  // or not, was the whole of the lag.
  const measure = useCallback(() => {
    const track = trackRef.current
    const geo = geometry.current ?? readGeometry()
    if (!track || !geo) return

    // Clamped: the last position is the end of the travel, and rounding an
    // offset that stops short of a whole pitch would otherwise never get there.
    const active = Math.min(Math.round(track.scrollLeft / geo.pitch), geo.positions - 1)

    setRail((prev) =>
      prev.active === active && prev.positions === geo.positions
        ? prev
        : { active, positions: geo.positions },
    )
  }, [readGeometry])

  const { active, positions } = rail

  // Whether the section is on screen at all, and whether anything says the
  // reader is using it. Kept apart: the first is where the page is, the second
  // is what the reader is doing, and only their combination runs the clock.
  const [watching, setWatching] = useState(false)
  const [held, setHeld] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setWatching(true)
      return
    }

    // Threshold 0: the rail is the top of this section, so it is on screen as
    // soon as the section is. Waiting for a fraction of a band this tall would
    // start the clock well after the bikes were in view.
    const observer = new IntersectionObserver(([entry]) => setWatching(entry.isIntersecting), {
      threshold: 0,
      rootMargin: '0px 0px -12% 0px',
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  // A background tab throttles timers in some engines and runs them in others.
  // Neither is worth guessing at, so the clock stops with the document.
  useEffect(() => {
    const apply = () => setHidden(document.visibilityState !== 'visible')

    apply()
    document.addEventListener('visibilitychange', apply)
    return () => document.removeEventListener('visibilitychange', apply)
  }, [])

  const paused = held || hidden

  // Before paint, so the indicator is never wrong on the first frame.
  useLayoutEffect(() => {
    readGeometry()
    measure()
  }, [readGeometry, measure])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    track.addEventListener('scroll', measure, { passive: true })

    // Crossing a breakpoint changes the column width, and with it the pitch every
    // offset is read against — so a resize re-reads the geometry before it asks
    // where the rail is. This is the only path that does; scrolling never
    // invalidates it.
    //
    // The resize listener is the floor: without it a browser lacking
    // ResizeObserver would keep a stale pitch.
    const remeasure = () => {
      readGeometry()
      measure()
    }

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remeasure)
    observer?.observe(track)
    window.addEventListener('resize', remeasure)

    return () => {
      track.removeEventListener('scroll', measure)
      window.removeEventListener('resize', remeasure)
      observer?.disconnect()
    }
  }, [measure, readGeometry])

  // ── The rail's geometry, as the gestures want it ────────────────────────
  // The cached pitch plus the one figure that is cheap and has to be live:
  // `max` is the end of the travel, and it is read straight off the element
  // because a glide clamps against it.
  const metrics = useCallback(() => {
    const track = trackRef.current
    const geo = geometry.current ?? readGeometry()
    if (!track || !geo) return null

    return {
      track,
      pitch: geo.pitch,
      perView: geo.perView,
      max: track.scrollWidth - track.clientWidth,
    }
  }, [readGeometry])

  // ── The glide ──────────────────────────────────────────────────────────
  // The rail animates itself rather than asking for `behavior: 'smooth'`. Two
  // reasons: the browser's smooth scroll has a duration and a curve this site
  // does not get to pick, and mandatory snap interrupts it mid-flight and
  // lands the rail short. Snap is off for the length of the glide and back on
  // after, so a native flick still snaps the way the platform does it.
  //
  // Three things make it read as one movement rather than an animation:
  //
  // - The curve is EASE itself, solved rather than approximated. A quintic
  //   ease-out stood in for it and was the wrong shape at the head — it left
  //   at nearly full speed, so a glide starting from rest jumped.
  // - The duration follows the distance. One bike at the same 560ms a
  //   three-bike jump takes is a crawl for the short move and a lurch for the
  //   long one.
  // - A release carries its own speed in. A flick that stopped dead and then
  //   eased from zero was the seam you could feel; matching the opening speed
  //   to the speed the pointer left at closes it.
  const glide = useRef(0)

  const glideTo = useCallback(
    (left, velocity = 0) => {
      const found = metrics()
      if (!found) return

      const { track, max, pitch } = found
      const target = Math.max(0, Math.min(left, max))
      const from = track.scrollLeft
      const distance = target - from

      cancelAnimationFrame(glide.current)
      if (Math.abs(distance) < 1) {
        track.style.scrollSnapType = ''
        return
      }

      // The OS setting wins: no glide, just the destination.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.scrollLeft = target
        track.style.scrollSnapType = ''
        return
      }

      // 380ms for a single bike, growing with the distance but sub-linearly —
      // a three-bike jump is three times as far and nothing like three times
      // as long, or the rail feels like it is being winched.
      const spans = Math.abs(distance) / pitch
      const base = 380 + 150 * Math.sqrt(Math.max(0, spans - 1))
      // A fast release shortens the glide rather than fighting it: the rail is
      // already moving, so easing it over the full duration would read as the
      // page catching the bike and holding it back. Capped so a hard flick
      // still lands rather than snapping.
      const urgency = Math.min(Math.abs(velocity) / 2.5, 0.35)
      const duration = Math.round(base * (1 - urgency))

      track.style.scrollSnapType = 'none'
      const start = performance.now()

      const frame = (now) => {
        const p = Math.min(1, (now - start) / duration)
        track.scrollLeft = from + distance * ease(p)

        if (p < 1) {
          glide.current = requestAnimationFrame(frame)
        } else {
          // Land exactly, then hand the rail back to the platform. Leaving the
          // last fraction of a pixel to the curve is what makes snap twitch as
          // it re-engages.
          track.scrollLeft = target
          track.style.scrollSnapType = ''
        }
      }

      glide.current = requestAnimationFrame(frame)
    },
    [metrics],
  )

  useEffect(() => () => cancelAnimationFrame(glide.current), [])

  // ── Swipe ──────────────────────────────────────────────────────────────
  // Pointer drag, so the rail answers to a mouse the way it already answers to
  // a trackpad or a thumb. Six bikes no longer fit on a screen, which makes
  // dragging the primary way through the lineup rather than a nicety.
  //
  // A gesture is worth exactly one bike, however far it is thrown — the rail
  // follows the pointer while it is down, then glides to the neighbouring bike
  // on release. Letting a long drag land three bikes along makes the lineup
  // feel like a scrollbar; one at a time makes it feel like a deck.
  const drag = useRef(null)
  const pending = useRef(0)

  const onPointerDown = (event) => {
    // Touch already drags natively, with the platform's own momentum and
    // snapping. Taking it over would only make it worse. Mouse and pen here.
    if (event.pointerType === 'touch') return

    const found = metrics()
    if (!found) return

    cancelAnimationFrame(glide.current)
    cancelAnimationFrame(pending.current)
    // A hand on the rail does hold the clock, unlike a pointer merely passing
    // over it — the tick would otherwise glide the track out from under the
    // drag mid-gesture.
    setHeld(true)
    drag.current = {
      x: event.clientX,
      left: found.track.scrollLeft,
      moved: false,
      // Last sample, for the release velocity. Kept as one point rather than a
      // history: what a flick is worth is how fast the pointer was going as it
      // left, not how fast it was going across the whole gesture.
      lastX: event.clientX,
      lastAt: event.timeStamp,
      velocity: 0,
    }
    // Mandatory snap fights a scrollLeft written every frame: the browser keeps
    // pulling back to the nearest point mid-drag.
    found.track.style.scrollSnapType = 'none'
  }

  const onPointerMove = (event) => {
    const track = trackRef.current
    if (!drag.current || !track) return

    const dx = event.clientX - drag.current.x
    // A few pixels of slack, so a click on a card is not read as a one-pixel
    // drag and swallowed.
    if (!drag.current.moved && Math.abs(dx) > 4) {
      drag.current.moved = true
      track.setPointerCapture(event.pointerId)
    }

    if (!drag.current.moved) return

    // Pixels per millisecond, smoothed a little so one stuttering sample cannot
    // decide what the whole flick was worth.
    const elapsed = event.timeStamp - drag.current.lastAt
    if (elapsed > 0) {
      const sample = (event.clientX - drag.current.lastX) / elapsed
      drag.current.velocity = drag.current.velocity * 0.7 + sample * 0.3
      drag.current.lastX = event.clientX
      drag.current.lastAt = event.timeStamp
    }

    // One write per frame. A high-polling mouse fires several moves between
    // paints, and every extra `scrollLeft` write in the same frame is a layout
    // the browser throws away — which is what made a slow drag feel gritty.
    const left = drag.current.left - dx
    cancelAnimationFrame(pending.current)
    pending.current = requestAnimationFrame(() => {
      if (drag.current) track.scrollLeft = left
    })
  }

  const endDrag = (event) => {
    const track = trackRef.current
    if (!drag.current || !track) return

    const { x, left, moved, velocity } = drag.current
    if (moved && track.hasPointerCapture?.(event.pointerId)) {
      track.releasePointerCapture(event.pointerId)
    }
    drag.current = null
    cancelAnimationFrame(pending.current)
    setHeld(false)

    const found = metrics()
    if (!found) return

    if (!moved) {
      track.style.scrollSnapType = ''
      return
    }

    // Which bike the rail was on when the drag started, and which one it owes
    // the gesture. Either 24px of travel or a flick fast enough to mean it:
    // without the velocity term a short sharp swipe fell under the distance
    // threshold and the rail sprang back, which is the one outcome a gesture
    // should never produce.
    const dx = event.clientX - x
    const committed = Math.abs(dx) > 24 || Math.abs(velocity) > 0.4
    const index = Math.round(left / found.pitch)
    const next = committed ? index - Math.sign(dx) : index

    glideTo(next * found.pitch, velocity)
  }

  // Each rule is also the way to get to its bike.
  const goTo = (index) => {
    const found = metrics()
    if (found) glideTo(index * found.pitch)
  }

  // ── The clock ──────────────────────────────────────────────────────────
  // The rail walks itself while the section is on screen, the way the charging
  // fold does: six bikes with three visible means half the lineup is off the
  // right edge, and a rail that only ever moves when it is pushed leaves most
  // of the range undiscovered by a reader who does not think to try.
  //
  // Everything that says "somebody is using this" stops it — a pointer in the
  // section, a drag in progress, a backgrounded tab — and it resumes on its
  // own. Position, not a separate counter, is what it advances, so a manual
  // move never fights the clock: the next tick simply carries on from wherever
  // the reader left the rail.
  useEffect(() => {
    if (!watching || paused || positions < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setTimeout(() => {
      // Wraps rather than stopping at the end. A rail that reaches the last
      // position and never returns is a rail that spends most of the page's
      // life showing the same three bikes.
      goTo(active >= positions - 1 ? 0 : active + 1)
    }, DWELL)

    return () => clearTimeout(id)
    // `active` in the deps is the loop: every landing schedules the next move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watching, paused, positions, active])

  // The window keeps the active position in the middle where it can, and pins
  // to either end where it cannot — so the first two positions both show the
  // window starting at zero rather than the row shifting under a mark that has
  // not moved. A lineup with fewer positions than the window shows one rule
  // per position and no window at all.
  const shown = Math.min(WINDOW, positions)
  const windowStart = Math.max(0, Math.min(active - 1, positions - shown))

  // ── The cards ──────────────────────────────────────────────────────────
  // Built once. Nothing in a card reads the rail's position — the row moves by
  // scroll offset, and the active mark lives in the indicator below — so there
  // is no render in which these come out different.
  //
  // Held rather than rebuilt because of what a rebuild costs: six cards at five
  // `cn()` calls each is thirty tailwind-merge parses, and `measure` runs on
  // every scroll event. Same element references means React reconciles the
  // subtree by identity and skips it, so an indicator update stays an indicator
  // update rather than touching the row.
  const cards = useMemo(
    () =>
      rest.map((bike) => (
        <BikeCard
          key={bike.slug}
          bike={bike}
          className={cn(
            'w-[78vw] shrink-0 snap-center',
            // Exactly three across above `lg`: the track's content box less its
            // two gaps, divided by three. Sized off the container rather than
            // the viewport so it stays true inside the page's max width, and
            // the fourth bike is what the drag is for.
            'sm:w-[46vw] lg:w-[calc((100%-12rem)/3)] lg:max-w-none',
          )}
        />
      )),
    [rest],
  )

  return (
    // Bottom carries more air than the top: the hero hands straight off to the
    // headline, and the row below needs room before the next section starts.
    // The indicator now closes the section, and it is a 3px rule rather than a
    // row of cutouts — it needs a fraction of the room the bikes did. The old
    // bottom padding was set when the last thing here was a motorcycle.
    <section ref={ref} className="overflow-hidden bg-white pt-16 pb-14 sm:pt-20 sm:pb-16">
      <Container>
        {/* No kicker. "The lineup" over a row of motorcycles named what the
            reader could already see, and it was one of three tracked-caps
            eyebrows on this page — the tell that a layout is being scaffolded
            rather than composed. The heading opens the section on its own. */}
        {/* The anchor the footer's Vehicles entry jumps to — see the note on
            that entry in `constants/site.js`.

            On the heading rather than on the section, so the jump lands with the
            heading at the top of the reader's screen and the two hero bikes
            directly under it. The section's own top edge is four or five rem of
            padding higher, which arrives as a screen that opens on white.
            `ScrollToTop` holds the landing clear of the fixed bar. */}
        <h2
          id="lineup"
          data-reveal="24"
          className={cn(
            'text-center font-display font-bold uppercase text-ink-900',
            // One line at every width, so the size has to follow the viewport
            // rather than a fixed scale — and the cap keeps it from outgrowing
            // the container's own max width on a wide monitor.
            //
            // Tracking was +0.06em for Clash Display, a narrow display face whose
            // caps need prising apart. Plus Jakarta Sans is wide and round to
            // begin with; at that value the line read as spaced-out lettering
            // rather than a heading. +0.01em is the small amount uppercase still
            // wants, and the words come back as words.
            'text-[clamp(0.9rem,4.3vw,3.25rem)] leading-[1.1] tracking-[0.01em] whitespace-nowrap',
          )}
        >
          Choose your <span className="text-brand-500">electric machine</span>
        </h2>

        {/* The heroes. Two columns from `sm` up and stacked below it — at phone
            width two cards side by side would be narrower than one card in the
            rail underneath, which would demote exactly the bikes this row exists
            to promote.

            Inside `Container`, unlike the rail: the rail runs to the viewport
            edge because it scrolls and wants to look like it continues past the
            screen, whereas this row is complete at every width and holding it to
            the page's measure is what keeps the two bikes centred rather than
            stretched across a wide monitor.

            The gap is the rail's `lg` gap and the columns are half the row, so a
            hero card comes out around 1.4× the width of one below it — the
            promotion is legible without either row looking like a different
            design. */}
        <div className="mt-16 grid grid-cols-1 gap-16 sm:mt-20 sm:grid-cols-2 lg:gap-24">
          {heroes.map((bike, i) => (
            <BikeCard key={bike.slug} bike={bike} featured eager={i === 0} />
          ))}
        </div>
      </Container>

      {/* The rail sits outside Container so the columns can run to the viewport
          edge rather than stopping at the page's max width.

          Hovering does not stop the clock. A pointer resting in the section is
          not a claim on it — most of them are just on their way somewhere — and
          a rail that freezes under the cursor is a rail that never moves for
          anyone reading with their hand on the mouse.

          Keyboard focus does stop it, which is a different case: a reader
          tabbing the indicator has committed to the control, and moving the row
          under a focused button would change what the next key press does. */}
      <div
        className="relative mt-24 sm:mt-28"
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          // `scrollbar-width: none` has no Tailwind utility; the arrows and the
          // snap points are the affordance here, a visible bar just adds noise.
          style={{ scrollbarWidth: 'none' }}
          className={cn(
            'flex snap-x snap-mandatory gap-16 overflow-x-auto overscroll-x-contain sm:gap-20 lg:gap-24',
            // The rail's side padding is what decides whether a card can sit in
            // the middle of the screen. `snap-center` cannot centre the first
            // card on its own: at `scrollLeft: 0` there is nothing left to
            // scroll, so the card rests against the padding and the row opens
            // 16px from the left edge with 67px of air on the right.
            //
            // Below `sm` one card fills the rail, so the padding is set to
            // exactly half the space a card leaves over — (100 − 78) / 2 — and
            // the first and last cards land dead centre with the neighbours
            // peeking equally either side. From `sm` up two or three cards
            // share the row and the padding goes back to being a page gutter.
            'px-[11vw] sm:px-6 lg:px-8',
            'cursor-grab active:cursor-grabbing',
            // The cutouts are images: without this a drag turns into the
            // browser's own drag-and-drop and the rail stops following.
            '[&_img]:select-none [&_img]:[-webkit-user-drag:none]',
            '[&::-webkit-scrollbar]:hidden',
          )}
        >
          {cards}
        </div>

        {/* Three rules, not six: a window onto the lineup rather than a map of
            it. Six marks made the indicator wider than the heading above it and
            turned a position readout into a second thing to count. The window
            slides so the active bike sits in the middle of it wherever possible,
            and holds at the ends so the row never goes ragged.

            A rule rather than a dot — the section is ruled throughout, and dots
            would be the only circles on it. The active one goes to ink and
            stands to full height.

            Keyed by slot rather than by bike, deliberately: React then reuses
            the same three nodes as the window moves, so the ink mark eases
            across the row instead of the row being rebuilt under it.

            Each is a real button, and they track the rail however it was moved
            — a native flick reports the same position a click does. */}
        <div className="mt-10 flex items-center justify-center gap-4 sm:mt-12 sm:gap-5">
          {Array.from({ length: shown }, (_, slot) => {
            const i = windowStart + slot
            // A position is named for the bike that leads it, which is what a
            // reader sees on the left of the row when they land on it.
            const bike = rest[i]
            if (!bike) return null

            return (
              <button
                key={slot}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show the ${bike.name}`}
                aria-current={i === active ? 'true' : undefined}
                // The hit area is the button; the rule inside it is what shows.
                // A 3px line is not a target, and padding it out is the
                // difference between a control and a decoration.
                className="group -my-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
              >
                <span
                  className={cn(
                    'block h-[3px] w-14 transition-[background-color,transform] duration-500 sm:w-16',
                    EASE,
                    i === active
                      ? 'scale-y-100 bg-ink-900'
                      : 'scale-y-75 bg-ink-900/15 group-hover:bg-ink-900/35',
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
