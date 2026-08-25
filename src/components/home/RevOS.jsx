import { useEffect, useRef, useState } from 'react'
import Container from '@/components/ui/Container'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'

// Imported rather than referenced out of `public/` so Vite hashes them and
// fingerprints the cache, the same way the lineup's cutouts are handled.
import bikeStatus from '@/assets/images/bike-status.avif'
import digitalKey from '@/assets/images/digital-key.avif'
import liveTracking from '@/assets/images/live-tracking.avif'
import findMyBike from '@/assets/images/find-my-bike.avif'
import sosAlerts from '@/assets/images/sos-alerts.avif'
import swipeControl from '@/assets/images/swipe-control.avif'
import soundControl from '@/assets/images/sound-control.avif'
import voiceControl from '@/assets/images/voice-control.avif'
import geofence from '@/assets/images/geofence.avif'
import serviceSupport from '@/assets/images/service-and-support.avif'

/**
 * The app, as a hub: the live screen in the middle of the fold with the ten
 * capabilities flanking it, five to a side, each wired to the screen by a
 * hairline that only carries current when its capability is the one on show.
 *
 * The screens are the real thing, 551x1190 with alpha, one per capability. That
 * is what earns the composition: the labels are the control, the screen is the
 * evidence, and the caption underneath says what you are looking at. Nothing here
 * is drawn to stand in for the app.
 *
 * The handset around the plates is chrome only — rim, bezel, mask, island —
 * because the repo has no device render and none of the app's interface is mine to
 * draw. Proportions are an iPhone Pro's: the plates are 0.4630 wide to tall and
 * the 15/16 Pro screen is 0.4612.
 *
 * The mask radius is measured off the plates rather than guessed. Their corner arc
 * is about 85px in a 551-wide file, which is 40px once the plate is drawn 256
 * wide. Cut smaller than that and the backdrop shows through the arc as a pale
 * outline curving across the dark half of the screen.
 *
 * The copy sits below the screen, not over it. Type over a screenshot has to beat
 * the interface underneath it for contrast, and the loser is always the
 * screenshot — which is the one thing this section exists to show.
 *
 * White, not another black fold. The battery section above is ink-950 edge to
 * edge; a second dark section directly beneath it would fuse into one long dark
 * block with no seam between two unrelated ideas.
 *
 * No eyebrow: the lineup above already opens with one, and so does the benefits
 * row below. A third turns a device into a template.
 *
 * Below `lg` the wires are meaningless, since nothing is beside anything, so they
 * come off and the fold stacks: screen, caption, then the two rails side by side
 * as two columns of labels under it. Side by side rather than end to end because
 * ten stacked labels ran past the bottom of a phone and the seam between the
 * rails read as a gap in one list rather than as the join between two.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// Ten, five to a side, paired across the screen where the pairing means
// something: status opposite starting, key opposite the swipe that follows it,
// the two that find the bike opposite the two you talk to, and the two you reach
// for when something has gone wrong facing each other at the bottom.
const CAPABILITIES = [
  {
    id: 'status',
    label: 'Bike status',
    side: 'left',
    image: bikeStatus,
    headline: 'Charge and range, before you walk down',
    body: 'State of charge, estimated range and whether the bike is locked, without going near it.',
  },
  {
    id: 'key',
    label: 'Digital key',
    side: 'left',
    image: digitalKey,
    headline: 'Your phone unlocks it',
    body: 'Approach, unlock and start from the app. The physical key stays in a drawer as the backup.',
  },
  {
    id: 'tracking',
    label: 'Live tracking',
    side: 'left',
    image: liveTracking,
    headline: 'Its position, on a map, whenever you look',
    body: 'Follow the bike while somebody else is riding it, and read the route back once they stop.',
  },
  {
    id: 'find',
    label: 'Find my bike',
    side: 'left',
    image: findMyBike,
    headline: 'Pick it out of a full row',
    body: 'The bike sounds and flashes on command, which turns a crowded parking row into a glance.',
  },
  {
    id: 'sos',
    label: 'SOS alerts',
    side: 'left',
    image: sosAlerts,
    headline: 'It asks for help with your location attached',
    body: 'Emergency contacts are one tap away, and the request carries where you are.',
  },
  {
    id: 'swipe',
    label: 'Swipe control',
    side: 'right',
    image: swipeControl,
    headline: 'One swipe wakes the motor',
    body: 'Starting is a deliberate gesture on the screen, so a pocket cannot bring the bike to life.',
  },
  {
    id: 'sound',
    label: 'Sound control',
    side: 'right',
    image: soundControl,
    headline: 'Choose the note it makes',
    body: 'An electric motor is silent, so this one is given a voice you pick and can change at the lights.',
  },
  {
    id: 'voice',
    label: 'Voice control',
    side: 'right',
    image: voiceControl,
    headline: 'Talk to the bike',
    body: 'Ask for charge, range or a ride mode without stopping to find the right screen.',
  },
  {
    id: 'geofence',
    label: 'Geofencing',
    side: 'right',
    image: geofence,
    headline: 'Draw a boundary around home',
    body: 'Set the area the bike belongs in. Cross the line and your phone knows before you would notice.',
  },
  {
    id: 'service',
    label: 'Service and support',
    side: 'right',
    image: serviceSupport,
    headline: 'Book a service without a phone call',
    body: 'Raise a request, watch it move, and reach roadside assistance from the same screen.',
  },
]

const ORDER = CAPABILITIES.map((item) => item.id)

export default function RevOS() {
  const [ref, shown] = useReveal({ threshold: 0.08 })
  // The screen only ever moves because somebody moved it. An earlier version ran
  // itself on a timer until the first click, which demonstrated the ten
  // capabilities without being asked but also changed the screen under a reader
  // still on the caption of the last one.
  const [active, setActive] = useState(CAPABILITIES[0].id)
  const [unwatched, setUnwatched] = useState(false)
  const railsRef = useRef(null)

  const current = CAPABILITIES.find((item) => item.id === active) ?? CAPABILITIES[0]

  // Everything in this fold is gated behind the reveal, so an observer that never
  // fires takes the whole section away rather than just its entrance. A document
  // already hidden at mount is exactly that case: a tab rendered in the
  // background, a print, a headless screenshotter. Skip the choreography and just
  // be there; once it becomes visible the observer does its own job. Same guard
  // as the battery fold above, for the same reason.
  useEffect(() => {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') return

    setUnwatched(true)
  }, [])

  const here = shown || unwatched

  // A toggle group rather than a tablist, and deliberately. A tablist is only
  // valid when the tabs are children of the element carrying the role, and these
  // ten are split into two rails standing either side of the thing they control.
  // Faking it with `aria-owns` to satisfy the role would be a worse lie than not
  // claiming the role: pressed buttons plus a polite live region on the caption
  // say exactly what this is, and every button keeps its own tab stop, which is
  // what a group of toggles is supposed to do.
  //
  // Arrow keys walk the whole set anyway, in the order written above, because the
  // rows read as one list even though they are drawn as two.
  const onKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    const jump = { Home: 0, End: ORDER.length - 1 }[event.key]

    if (step === undefined && jump === undefined) return
    event.preventDefault()

    const from = ORDER.indexOf(active)
    const next = jump ?? (from + step + ORDER.length) % ORDER.length

    setActive(ORDER[next])
    railsRef.current?.querySelector(`#revos-tab-${ORDER[next]}`)?.focus()
  }

  // One row of a flanking column. `side` decides which way the label sits and
  // which way its wire runs, so the two columns mirror rather than repeat.
  const renderTab = (item, i) => {
    const selected = item.id === active
    const left = item.side === 'left'

    return (
      <button
        key={item.id}
        type="button"
        id={`revos-tab-${item.id}`}
        aria-pressed={selected}
        aria-controls="revos-screen"
        onClick={() => setActive(item.id)}
        className={cn(
          'group flex items-center gap-3 py-2 lg:gap-4',
          // Mirrored: on the left column the label leads and the wire runs out of
          // its right edge toward the screen; on the right column the wire
          // arrives first. On a phone both columns read left to right.
          left ? 'lg:flex-row' : 'lg:flex-row-reverse',
          'transition-[transform,opacity] duration-700',
          EASE,
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
          here ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
        // Top down each column, so the wires appear to reach for the screen
        // rather than all light at once.
        style={{ transitionDelay: here ? `${220 + i * 55}ms` : '0ms' }}
      >
        <span
          className={cn(
            // Wraps below `lg` and only there. In two phone-width tracks the
            // longest label ("Service and support") is wider than its column,
            // and held on one line it would push the grid past the gutter. From
            // `lg` the rails are wide enough to hold every label on one line,
            // and there a wrap would break the wire running out of it.
            'font-display font-bold tracking-[-0.015em] lg:whitespace-nowrap',
            // Up a step from 16/18. Against a 280px handset and rails this wide,
            // 16px labels read as captions on a diagram rather than as the thing
            // you are meant to choose from, and the fold's only interactive type
            // should not be its smallest.
            'text-lg sm:text-xl',
            // Inactive rows are ink-500 on white, which measures 5.30:1 — they read as
            // unselected without dropping below the body-text bar, since these are
            // controls and not decoration.
            'transition-colors duration-500',
            EASE,
            selected ? 'text-ink-900' : 'text-ink-500 group-hover:text-ink-900',
          )}
        >
          {item.label}
        </span>

        {/* The wire. Every row stays connected to the screen on a faint track, and
            the selected one is the only one carrying current: a red line drawn
            along the track from the label inward. Two elements rather than one
            growing element, because the fill runs on `scaleX` — a transform,
            composited, no layout on any frame — where an animated width or
            flex-grow would reflow the whole rail sixty times a second. Hidden
            below `lg`, where there is no screen beside it to reach. */}
        <span
          aria-hidden="true"
          className={cn(
            'hidden h-px grow overflow-hidden bg-ink-900/15 lg:block',
            'transition-colors duration-500',
            EASE,
            'group-hover:bg-ink-900/30',
          )}
        >
          <span
            className={cn(
              'block h-px bg-brand-500',
              'transition-transform duration-700',
              EASE,
              left ? 'origin-left' : 'origin-right',
              // A fifth of the line on hover: enough current to show the row is
              // live and which way it feeds, not enough to be mistaken for the
              // selected one.
              selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[0.2]',
            )}
          />
        </span>
      </button>
    )
  }

  const leftTabs = CAPABILITIES.filter((item) => item.side === 'left')
  const rightTabs = CAPABILITIES.filter((item) => item.side === 'right')

  return (
    <section ref={ref} className="overflow-hidden bg-white pt-20 pb-24 sm:pt-24 sm:pb-32">
      <Container>
        {/* Centred, because the composition under it is symmetrical about the
            screen and a left-aligned header would fight that axis. This is the
            one place on the page where centring is the structure rather than a
            default. */}
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className={cn(
              'font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1] font-bold tracking-[-0.03em] uppercase text-ink-900',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
            Rev<span className="text-brand-500">OS</span>
          </h2>

          <p
            className={cn(
              'mx-auto mt-5 max-w-[42ch] text-lg leading-relaxed text-ink-500 text-pretty',
              'transition-[transform,opacity] duration-700',
              EASE,
              here ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: here ? '120ms' : '0ms' }}
          >
            One app between you and the bike. Pick a capability and the screen
            changes with it.
          </p>
        </div>

        {/* The hub. Three tracks at `lg`: labels, screen, labels. The screen
            column is sized by its own image and the two rails share what is left,
            so the screen never squeezes and the wires take up the slack. */}
        <div
          ref={railsRef}
          role="group"
          aria-label="RevOS capabilities"
          onKeyDown={onKeyDown}
          // `items-stretch` at `lg` so the rails inherit the screen's height and
          // can space their five rows across it. Centred, they clustered in the
          // middle and read as an afterthought beside it.
          //
          // Held to 5xl inside a 6xl container, and given a wider gutter. At full
          // container width each rail was 364px for a label of about 200, so two
          // thirds of every row was wire: the dead space between the type and the
          // handset was the loudest thing in the fold. Pulling the hub in to 1024
          // takes the rails to ~324 and the wires to roughly the length of the
          // labels they carry, which is what makes them read as a harness rather
          // than as leader dots in a table of contents.
          //
          // Two columns from the smallest screen up, which is what puts the two
          // rails beside each other rather than end to end. Stacked, the ten
          // labels ran to about a screen and a half on a phone, and the seam
          // between the rails read as an unexplained gap in one long list — the
          // five below it looked like a second, lesser group. Side by side they
          // are visibly one set again, and the whole fold fits in a viewport.
          // The screen and the caption span both tracks; at `lg` the three-track
          // hub takes over and the spans are released.
          className="mx-auto mt-14 grid max-w-5xl grid-cols-2 items-center gap-x-5 gap-y-10 sm:mt-16 sm:gap-x-8 lg:mt-20 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-x-12"
        >
          {/* Left rail. Third on a phone, where the order is screen, caption, then
              the two rails side by side; `lg:order-first` puts it back beside the
              screen.

              `self-start` so the two rails hang from the same line. Centred — the
              grid's default here — a column that wrapped a label would sit half a
              row lower than its neighbour, and the two lists would stop reading
              as one set. */}
          <div className="order-3 flex flex-col items-start gap-1 self-start lg:order-first lg:items-stretch lg:justify-between lg:self-auto lg:py-8">
            {leftTabs.map((item, i) => renderTab(item, i))}
          </div>

          {/* The handset. The plates are bare app screens — white UI, transparent
              corners, no device chrome of any kind (checked: the corner pixels are
              alpha 0 and the fill is 255,255,255) — so on a white page they had no
              edges at all and read as flat white rectangles. The device is what
              gives them an edge, a scale and something to sit in.

              Sized by the screen, not the frame: the mask carries the plates' exact
              ratio and the rim and bezel add their own thickness outside it, so the
              screenshots are never cropped or stretched to fit a box. */}
          <div
            id="revos-screen"
            className={cn(
              // The cap is per breakpoint, not global: 16rem keeps the handset off
              // the gutters on a phone, and the desktop one is allowed the full
              // 17.5rem the rails were sized around.
              'relative order-1 col-span-2 mx-auto w-[62vw] max-w-[16rem] sm:w-[13rem] lg:order-none lg:col-span-1 lg:w-[17.5rem] lg:max-w-[17.5rem]',
              'transition-[transform,opacity] duration-1000',
              EASE,
              here ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.97] opacity-0',
            )}
          >
            {/* The light the screen sits in: a wash of brand red behind the plate
                and a tinted cast under it. Both are behind the image and inert.
                The cast is the ink hue rather than pure black, and it is thrown
                low, so the plate reads as standing on the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10"
              style={{
                backgroundImage:
                  'radial-gradient(45% 40% at 50% 42%, rgba(244,51,51,0.20), rgba(255,255,255,0) 70%)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 -bottom-4 -z-10 h-16 rounded-[50%] bg-ink-900/30 blur-2xl"
            />

            {/* The side hardware, on the rim's outer face: action button and volume
                pair on the left, wake on the right, at the heights they sit at on
                the device. Behind the rim in the stack so they read as attached to
                it rather than floating beside it. */}
            {[
              { side: 'left', top: '19%', height: '4.2%' },
              { side: 'left', top: '27.5%', height: '7.5%' },
              { side: 'left', top: '36.5%', height: '7.5%' },
              { side: 'right', top: '29%', height: '11%' },
            ].map((button, i) => (
              <span
                key={`${button.side}-${i}`}
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute w-[2px] rounded-full bg-gradient-to-b from-ink-500 via-ink-800 to-ink-500',
                  button.side === 'left' ? '-left-[2px]' : '-right-[2px]',
                )}
                style={{ top: button.top, height: button.height }}
              />
            ))}

            {/* The rim. Brushed titanium is a gradient with three turns in it: a
                lit top left, a shadowed middle and a second highlight before the
                far edge. One flat grey reads as plastic. */}
            <div
              className="relative rounded-[3.25rem] p-[3px] shadow-[0_24px_50px_-20px_rgba(18,18,20,0.45)]"
              style={{
                backgroundImage:
                  'linear-gradient(150deg, #d6d6db 0%, #8d8d95 22%, #e2e2e7 44%, #74747c 62%, #c3c3c9 82%, #7c7c84 100%)',
              }}
            >
              {/* The bezel. Black, and thin: 9px against a 280px screen is close
                  to the real ratio, and anything thicker starts to read as an
                  older handset. */}
              <div className="relative overflow-hidden rounded-[3.05rem] bg-ink-950 p-[9px]">
                {/* The glass. Carries the plates' exact aspect ratio so nothing
                    inside it is stretched, and it is device black underneath: the
                    plates are rounded rectangles with alpha corners, so whatever
                    sits behind them shows through at the arcs, and black is the
                    only colour that can pass for the screen being off there.

                    2.5rem, measured off the plates rather than guessed. Their arc
                    is about 85px in a 551-wide image, which is 40px once the plate
                    is drawn 256 wide, and the mask was cut at 31: the missing 9px
                    of radius is exactly where the backdrop was showing through as a
                    pale outline curving across the dark half of the screen. The
                    bezel and rim step outward from here by their own thickness, so
                    the three arcs stay concentric. */}
                <div className="relative aspect-[551/1190] w-full overflow-hidden rounded-[2.5rem] bg-ink-950">
                  {/* All ten plates are mounted and crossfaded rather than one
                      `src` being swapped. A swap on a cycle shows the gap while the
                      next file decodes — on the first pass every time, and on a
                      slow connection every pass. Stacked, the fade is between two
                      decoded images. They are the same size to the pixel, so the
                      crossfade reads as the screen changing rather than one picture
                      replacing another. */}
                  {CAPABILITIES.map((item, i) => (
                    <img
                      key={item.id}
                      src={item.image}
                      // Only the plate on screen is described. The other nine are
                      // mounted for the crossfade, not for reading, and ten alt
                      // texts stacked in one place would be ten images to page
                      // past.
                      alt={item.id === active ? `The RevOS ${item.label} screen` : ''}
                      aria-hidden={item.id !== active}
                      width={551}
                      height={1190}
                      // The first plate is the one on screen when the section
                      // arrives, so it is the only one worth fetching eagerly.
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={cn(
                        // Fitted exactly, not overfilled. The plates' interface
                        // does reach their own edges (sampled: the bottom row is
                        // 30,30,30 out to 3px from the left), so nothing has to be
                        // scaled past the mask to fill it. Scaling was hiding a
                        // problem that belonged to the mask, and cost 11px of the
                        // status bar and home indicator to do it.
                        'absolute inset-0 size-full object-cover',
                        'transition-opacity duration-500',
                        EASE,
                        item.id === active ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  ))}

                  {/* The island, over the plates because that is where it is on the
                      device: the screen runs behind it. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-[1.4%] left-1/2 h-[2.6%] w-[26%] -translate-x-1/2 rounded-full bg-ink-950"
                  />

                  {/* One raking highlight across the glass, low enough to read as a
                      reflection on a sheet rather than a gradient laid over the
                      interface. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(122deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.14) 16%, rgba(255,255,255,0) 34%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right rail. Rows align to the right edge so the two columns read as
              one shape mirrored about the screen. */}
          <div className="order-4 flex flex-col items-start gap-1 self-start lg:order-none lg:items-stretch lg:justify-between lg:self-auto lg:py-8">
            {rightTabs.map((item, i) => renderTab(item, i + leftTabs.length))}
          </div>

          {/* The caption, inside the hub rather than after it. Under the plate on
              a phone — where it followed both rails, tapping a label rewrote a
              paragraph two screens down — and across the full width underneath
              everything at `lg`. Over the plate it never goes: type set on a
              screenshot has to beat the interface behind it for contrast, and the
              screenshot always loses.

              Polite and atomic: the caption changing is worth announcing, never
              worth cutting off what a reader is already hearing, and it is read as
              one statement rather than two paragraphs arriving separately. */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              'relative order-2 col-span-2 mx-auto max-w-xl text-center lg:order-last lg:col-span-3 lg:mt-2',
              'transition-opacity duration-700',
              EASE,
              here ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDelay: here ? '420ms' : '0ms' }}
          >
            {/* Keyed on the capability so React remounts the block and the site's
                `rise` animation replays on every swap. Without the key the text
                would change with no transition at all. */}
            <div key={current.id} className="animate-rise">
              <p className="font-display text-2xl leading-[1.12] font-bold tracking-[-0.02em] text-ink-900 sm:text-3xl text-balance">
                {current.headline}
              </p>
              <p className="mx-auto mt-3 max-w-[52ch] leading-relaxed text-ink-500 text-pretty">
                {current.body}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
