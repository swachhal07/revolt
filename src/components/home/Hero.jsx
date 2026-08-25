import { useCallback, useEffect, useRef, useState } from 'react'
import FilmDialog from '@/components/home/FilmDialog'
import PriceReveal from '@/components/home/PriceReveal'
import { ChevronRight } from '@/components/ui/icons'
import { getMotorcycleBySlug } from '@/data/motorcycles'
import { clearGateLift, gateJustLifted, isUnlocked, revealPreview } from '@/utils/gate'
import { cn } from '@/utils/cn'

/**
 * Full-bleed hero: the film plays on its own loop and nothing advances past it
 * unless a visitor picks one of the stills from the rail on the right.
 * Every asset lives in `public/` — they are large binaries, so they stay out of
 * the bundle graph and get served directly. Three of the stills are ~100 KB
 * WebP; re-run that step if any of them is replaced. The fourth is a 1.9 MB PNG
 * held at its supplied quality on request — see the note on it below.
 *
 * FULL FRAME, WEB BITRATE. `rvx-3d-v2.mp4` is the RVX 3D product video at its
 * native 2560x1440 / 30 fps, re-encoded from the master's 10 Mbps down to
 * 5.5 Mbps and cut from 2:12 to 2:00. 79 MB. The resolution is untouched, so
 * the crop below has the same pixels to work with as before; what went is
 * bitrate the eye does not get back on a muted, cropped background loop, plus
 * a 317 kbps audio track this element mutes anyway.
 *
 * 79 MB sits under GitHub's 100 MiB blob limit, which is the whole reason it
 * can live here rather than on a host. Do not re-encode it larger without
 * checking that number — over the limit the push is rejected outright, and
 * Git LFS is not a way around it: Vercel clones without resolving LFS and
 * would deploy the pointer file, serving 130 bytes of text as an MP4.
 *
 * The master is `src/assets/images/RVX 3D_Product_Video.mp4`, gitignored and
 * local-only. To regenerate this file from it:
 *
 *   ffmpeg -i "src/assets/images/RVX 3D_Product_Video.mp4" -t 120 \
 *     -c:v libx264 -preset slow -crf 22 \
 *     -an -movflags +faststart public/videos/rvx-3d.mp4
 */
// `position` is the object-position of the crop. Below 50% the window sits
// higher in the frame, so the rider's helmet clears the navbar instead of
// being cut by the top edge, and the surplus tarmac goes off the bottom.
const SLIDES = [
  {
    type: 'video',
    src: '/videos/rvx-3d-v2.mp4',
    poster: '/videos/rvx-3d-poster.jpg',
  },
  {
    type: 'image',
    src: '/images/hero/hardik-rvx.webp',
    alt: 'Rider standing with a Revolt RVX on a city flyover',
    position: 'center 40%',
  },
  {
    type: 'image',
    src: '/images/hero/rvx.webp',
    alt: 'Rider cornering a blue Revolt RVX',
    position: 'center 30%',
  },
  {
    type: 'image',
    src: '/images/hero/rv400brz.webp',
    alt: 'Revolt RV400 BRZ on the move',
    position: 'center 30%',
  },
  // The only PNG in the rail, and kept as one deliberately: it was supplied as a
  // PNG and is served with the pixels it arrived with, uncompressed.
  //
  // It costs. 1.9 MB against roughly 100 KB for each WebP beside it, so it is
  // nineteen times the weight of any other still. It is last in the rail and
  // lazily fetched, so it is not on the path to first paint — nothing waits for
  // it unless a visitor picks it. Promote it above the others and that stops
  // being true.
  //
  // A lossless WebP would be pixel-for-pixel identical and roughly a third
  // smaller; a quality-75 one would be under a tenth of this. Neither was taken.
  {
    type: 'image',
    src: '/images/hero/banner-1.png',
    alt: 'Rider cornering a black Revolt RV400 on an open hill road',
    // Same reasoning as the frames above: below 50% the window sits higher in
    // the frame, which keeps the rider's helmet clear of the navbar rather than
    // cropped by it, and spends the surplus tarmac off the bottom instead.
    position: 'center 40%',
  },
]

// The film opens on twelve seconds of logo sting: a glowing mark, the wordmark
// resolving at 8.2s, then the mark again in dark relief from ~11.5s before the
// first bike shot lands around 14s. The hero starts on that last mark, so the
// brand reads for a beat and the product arrives a second and a half later
// instead of five. Every seek in this component goes here, the loop included:
// `loop` on the element would wrap to zero and replay the whole sting.
const FILM_START = 12

// The machine the launch is of, and whose price the reveal prints. Named by slug
// for the reason `FLAGSHIP` is: `MOTORCYCLES` is ordered for the showroom and
// gets reshuffled, and a reveal that took its subject from position 0 would
// announce whichever bike last moved to the front.
const LAUNCH_BIKE = getMotorcycleBySlug('rvx')

// The two step controls. A constant rather than an inline literal so the render
// below can drop them wholesale while the reveal is up.
const CONTROLS = [
  { dir: -1, label: 'Previous slide', side: 'left-6 lg:left-10', flip: true },
  { dir: 1, label: 'Next slide', side: 'right-6 lg:right-10', flip: false },
]

/**
 * The price ladder the reveal walks down: the list price, struck through, and the
 * figure it is actually being sold for. Top to bottom, highest first — see
 * [[PriceReveal]] for the drop itself.
 *
 * Two rungs, and two is the whole argument: what the machine costs, and what it
 * costs at the show. A longer ladder of invented intermediate figures would make
 * the drop look staged rather than like a real offer.
 *
 * These are supplied figures, and they stay here rather than going into
 * [[motorcycles]] deliberately. That file is read by the model page, the lineup
 * cards, the EMI calculator and the FAQ, and it holds one price per machine — it
 * has nowhere to put "and this is the offer", so a show price entered there would
 * be quoted as the standing price across the whole site long after the show ends.
 * The RVX's `priceNpr` is still null; see the note below on setting it.
 */
const PRICE_LADDER = [
  { label: 'Actual MRP', amount: 433000 },
  { label: 'Exclusive NADA offer', amount: 399000 },
]

/**
 * Has the reveal already run in this page load?
 *
 * Module state, and the same reasoning as the gate's own lift flag in [[gate]]:
 * the reveal is a moment, and the hero remounts every time somebody navigates
 * away from home and back. Without this, stepping to a model page and returning
 * would replay the whole drop — which the lift flag used to prevent on its own,
 * because it was cleared on first use and never set again.
 *
 * It dies with the page, which is the point: a reload is a new page load, and a
 * reload is exactly when the reveal is now supposed to play.
 */
let revealShown = false

/**
 * Is the price reveal owed on this mount?
 *
 * Two ways in. The gate lifting in this page load is the original one — the
 * countdown running out in front of somebody, where the reveal is the end of the
 * sentence the gate started. The second is simply being past launch, which is
 * what makes the price survive a reload: before, a visitor who refreshed after
 * the drop had no way back to it, and the figures live nowhere else on the site
 * while the RVX's own `priceNpr` is still null.
 *
 * Both are still needed. Before launch the key opens the gate without
 * `isUnlocked` being true, and after it nothing sets the lift flag at all.
 */
const revealOwed = () => {
  if (LAUNCH_BIKE == null || revealShown) return false
  return gateJustLifted() || isUnlocked()
}

/**
 * The ladder the dev-only preview walks, or null when it is not running.
 *
 * `?reveal=389000` names its own landing figure — useful for checking how a
 * different number sets at display size — and bare `?reveal` walks the ladder as
 * authored. Either way it resolves to something: a preview door that silently
 * previews nothing is worse than no door.
 *
 * The array it returns is built once and held in state by the component below,
 * because [[PriceReveal]] schedules its whole sequence in an effect keyed on it —
 * a fresh array per render would restart the drop on every parent update.
 */
const previewLadder = () => {
  if (!LAUNCH_BIKE) return null

  const flag = revealPreview()
  if (flag == null) return null

  const landing = Number.parseInt(flag, 10)
  if (!landing) return PRICE_LADDER

  const last = PRICE_LADDER[PRICE_LADDER.length - 1]
  return [...PRICE_LADDER.slice(0, -1), { ...last, amount: landing }]
}

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [still, setStill] = useState(false)
  // The uncropped film, in a box. See [[FilmDialog]] — the hero's own crop is
  // right for a background and wrong for anybody who wants to watch the thing.
  const [film, setFilm] = useState(false)
  // Resolved during the first render rather than in an effect, because the film's
  // play effect runs on that same commit: settled a frame later, the video would
  // already have started underneath the reveal. The URL cannot change under this
  // component without a remount, so neither is ever recomputed.
  const [preview] = useState(previewLadder)
  const [reveal, setReveal] = useState(() => preview != null || revealOwed())
  const videoRef = useRef(null)

  // Both one-shots are spent here, and here rather than inside `revealOwed`
  // because that runs during render — twice, under StrictMode — and a read that
  // writes would then be deciding the answer to its own next call. The effect
  // runs once per mount after the state above is settled, which is late enough
  // to be honest and early enough that a remount in the same page load (someone
  // navigating away from home and back) sees the flag already set.
  useEffect(() => {
    clearGateLift()
    revealShown = true
  }, [])

  // Stable, because [[PriceReveal]] schedules its whole sequence off this in an
  // effect that must not re-run.
  const endReveal = useCallback(() => setReveal(false), [])

  // `autoPlay` ignores the OS motion setting, so read it here: reduced motion
  // holds the film on its poster frame. CSS can only stop transitions.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setStill(query.matches)

    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // The film stays mounted whichever slide is up so it never re-buffers; it
  // restarts when it's picked again, and idles while a still is showing.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // `!reveal` is what makes the sequence a sequence: while the price is on
    // screen the film holds on its poster frame, so it starts from the top when
    // the reveal dissolves instead of being four seconds in behind it.
    if (index === 0 && !still && !film && !reveal) {
      video.currentTime = FILM_START
      video.play().catch(() => {})
    } else {
      // The dialog counts: two copies of one file playing at once is two
      // decoders on a phone, and the one behind the backdrop is not being
      // watched by anybody.
      video.pause()
    }
  }, [index, still, film, reveal])

  // `autoPlay` starts the file at zero before any of the above runs, and a seek
  // needs metadata to have landed, so the opening position is set here too —
  // whichever fires first wins and the other is a no-op.
  const seekToStart = () => {
    const video = videoRef.current
    if (video && video.currentTime < FILM_START) video.currentTime = FILM_START
  }

  // Standing in for the `loop` attribute, which would wrap to zero. `ended`
  // only fires because `loop` is off.
  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = FILM_START
    video.play().catch(() => {})
  }

  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-ink-950 text-white">
      {SLIDES.map((slide, i) =>
        slide.type === 'video' ? (
          <video
            key={slide.src}
            ref={videoRef}
            className={cn(
              'absolute inset-0 -z-20 size-full object-cover',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
            src={slide.src}
            poster={slide.poster}
            onLoadedMetadata={seekToStart}
            onEnded={restart}
            // Off while the price is up, because `autoPlay` does not wait for the
            // effect above: it fires whenever the element has enough data, which
            // can land after the mount that paused it, and the film would then be
            // running under the reveal. Once the reveal clears, the effect starts
            // it — this attribute only ever governs the very first frame.
            autoPlay={!reveal}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            // All three are eager: they are in the viewport from the start, so
            // lazy-loading buys nothing and risks a blank frame on the swap.
            // ~100 KB each, and only the film competes with them for bandwidth.
            loading="eager"
            style={{ objectPosition: slide.position }}
            className={cn(
              // Slides swap outright. Cross-fading dipped through the near-black
              // section behind them — two half-transparent frames over ink-950
              // read as a dark flash before the new one lands.
              'absolute inset-0 -z-20 size-full object-cover transition-transform ease-out',
              i === index ? 'opacity-100' : 'opacity-0',
              // Slow push-in gives a still the pulse of the film it follows.
              i === index && !still ? 'scale-105 duration-[6000ms]' : 'scale-100 duration-0',
            )}
          />
        ),
      )}

      {/* Bottom fade only. A full vignette dimmed the photographs — they are
          far brighter than the film — so this just hands off to the section
          below and leaves the frame itself at full exposure. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{
          backgroundImage: 'linear-gradient(to top, rgba(5,5,5,0.6), rgba(5,5,5,0))',
        }}
      />

      {/* ── Watch the full frame ────────────────────────────────────────
          Only over the film, because it is the only slide there is a full
          frame of — offered over a photograph it would be a button that
          opens the wrong thing.

          Bottom-right, and drawn entirely in hairlines — the pill, the disc
          and the type all outline, nothing filled. The filled pill read as a
          second primary action on a hero that has none, and the red disc
          inside it put the site's accent on a control rather than on the
          thing the control is for. What is left is legible against footage
          because of its edge, not because of a panel behind it, which is how
          the rest of the site draws on dark ground. It sits in the fade that
          already darkens the bottom strip.

          Right rather than left: the left edge is where the eye enters the
          frame, and on the model pages that corner is left clear. It is the one
          affordance on the hero that is worth more on a phone than on a
          desktop: a 16:9 film in a portrait window loses both ends of every
          shot, and this is where that gets handed back. */}
      {index === 0 && !reveal ? (
        <button
          type="button"
          onClick={() => setFilm(true)}
          className={cn(
            'group absolute right-6 bottom-8 z-10 inline-flex items-center gap-3 rounded-full lg:right-10 lg:bottom-10',
            'border border-white/30 py-3 pr-5 pl-4 text-white',
            'transition-[border-color,background-color] duration-300 hover:border-white hover:bg-white/10',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid size-6 place-items-center rounded-full border border-white/40',
              'transition-colors duration-300 group-hover:border-white',
            )}
          >
            {/* A triangle drawn with borders — a play mark is three points and
                does not need an icon component of its own. Optically centred:
                a triangle's visual centre sits behind its geometric one, so it
                needs the half-pixel nudge a circle does not. */}
            <span className="ml-0.5 block size-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-white" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">
            Watch full frame
          </span>
        </button>
      ) : null}

      <FilmDialog
        open={film}
        onClose={() => setFilm(false)}
        src={SLIDES[0].src}
        poster={SLIDES[0].poster}
      />

      {/* Step controls, pinned to the edges and out of the composition's way.
          Glass, not a filled disc — the footage stays readable through them.
          Nothing rotates on its own: the film loops until a visitor steps off
          it.

          Unmounted while the price is up rather than just covered by it: left in
          place they would still take a tab stop behind the overlay, and stepping
          the slide out from under the reveal would leave it sitting over a
          photograph. */}
      {(reveal ? [] : CONTROLS).map((control) => (
        <button
          key={control.label}
          type="button"
          onClick={() =>
            setIndex((i) => (i + control.dir + SLIDES.length) % SLIDES.length)
          }
          aria-label={control.label}
          className={cn(
            'group absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full',
            'border border-white/25 bg-white/5 text-white backdrop-blur-[2px]',
            'transition-[background-color,border-color] duration-300 hover:border-white/50 hover:bg-white/15',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
            control.side,
          )}
        >
          <ChevronRight
            className={cn(
              'size-5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              control.flip
                ? 'rotate-180 group-hover:-translate-x-0.5'
                : 'group-hover:translate-x-0.5',
            )}
          />
        </button>
      ))}

      {/* Last in the section and last in the sequence: the seconds between the
          countdown ending and the film starting. See [[PriceReveal]] — once per
          page load from launch onwards, and nothing at all before it unless the
          gate was opened with the key. */}
      {reveal ? (
        <PriceReveal
          bike={LAUNCH_BIKE}
          // Passed in rather than read off the bike: a show offer is not the
          // machine's standing price, and the catalogue has nowhere to say so —
          // see `PRICE_LADDER`. It stays the single source of truth for every
          // other price on the site.
          rungs={preview ?? PRICE_LADDER}
          still={still}
          onDone={endReveal}
        />
      ) : null}
    </section>
  )
}
