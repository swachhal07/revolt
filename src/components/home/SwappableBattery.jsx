import { useEffect, useRef, useState } from 'react'
import Container from '@/components/ui/Container'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'

/**
 * How the battery comes out of the frame, given a full fold of its own.
 *
 * The master render is a silent CAD loop shot on pure white, which would read as
 * a glaring white rectangle on this surface. So the white is keyed out at the
 * source instead of in CSS: `public/videos/battery-dark.mp4` is the master with
 * a luma key knocking the background out onto #050505, which is `ink-950` to the
 * byte. The section and the film share one field, so there is no rectangle edge
 * to see and the pack needs no frame, card or corner radius around it.
 *
 * If the master is ever replaced, re-run the key rather than dropping the raw
 * file in:
 *   ffmpeg -i <master>.mp4 -f lavfi -i color=c=0x050505:s=1280x720:r=25 \
 *     -filter_complex "[0:v]lumakey=threshold=0.88:tolerance=0.12[k];\
 *       [1:v][k]overlay=shortest=1,format=yuv420p[o]" -map "[o]" -an \
 *     -c:v libx264 -preset slow -crf 24 -movflags +faststart battery-dark.mp4
 * The threshold matters: above 0.9 the white fringe survives, below 0.85 the
 * pack's light grey lid gets eaten along with the background.
 *
 * Because film and field share one black, the film is not sized as a picture in
 * a column — from `xl` up it *is* the fold, full-bleed. That is the only
 * treatment that does the footage justice: the loop orbits from a top-down over
 * the frame rails down into a close-up of the pack lifted clear of its cradle,
 * and at column scale that whole move played out inside ~600px.
 *
 * Nothing is set over the film: no heading, no paragraph. The mechanism is legible
 * without being narrated, and type over the pack needed a wash heavy enough to
 * cost the front half of it. What the fold carries besides the film is the rail at
 * its base — five figures, no heading and no link. Below `xl` the film sits in
 * flow above that rail, full-width and uncropped, which is the same arrangement a
 * phone gets: a fold-filling crop of a tall window would throw most of the
 * mechanism away.
 *
 * One fact about the footage sets the crop and the overlay: every frame has
 * hardware touching the left and bottom edges, so nothing can be cropped in from
 * those sides and the base rail needs a fade under it rather than clean black.
 * Verify with `ffmpeg -vf fps=4,scale=64:36,format=gray` over the master if the
 * film is ever recut.
 *
 * The rail carries the pack's own spec sheet, which is why these five are written
 * here rather than read off `MOTORCYCLES`: the catalogue describes bikes, and only
 * two of these (range, charge time) have a bike-level equivalent — with different
 * values, because the catalogue quotes the ride-mode range and a full 0-100 charge
 * where the pack sheet quotes IDC and 0-80.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// The pack's spec sheet, in the order it answers the fold's own claim: how far it
// goes, how fast it fills, what it survives, that it comes out at all, and how
// long it lasts. En dash in "0–80%" rather than a hyphen — it is a range.
const FIGURES = [
  { label: 'IDC range', value: '160 kms' },
  { label: 'Fast charging (0–80%)', value: '1 hr 20 min' },
  { label: 'Durability', value: 'IP67 rated' },
  { label: 'Battery type', value: 'Portable battery' },
  { label: 'Battery life', value: '12+ years' },
]

export default function SwappableBattery() {
  const [ref, inView] = useReveal({ threshold: 0.08 })
  const videoRef = useRef(null)
  const [still, setStill] = useState(false)
  const [unwatched, setUnwatched] = useState(false)

  // The rail and the film's settle are both gated behind the observer, and an
  // observer on a page nobody is looking at may never fire. A tab rendered in the
  // background or a headless
  // screenshotter would take the section away blank. If the document is already
  // hidden at mount, skip the choreography and just be there; once it becomes
  // visible the observer does its own job.
  useEffect(() => {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') return

    setUnwatched(true)
  }, [])

  const shown = inView || unwatched

  // `autoPlay` ignores the OS motion setting, so read it here: reduced motion
  // holds the film on its poster frame — which is the close-up beat, the one
  // frame worth holding. CSS can only stop transitions.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setStill(query.matches)

    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // Nothing is fetched until the fold is reached: the element carries
  // `preload="none"` and a poster, so the file only lands for visitors who
  // scroll this far, and never for those who asked for less motion.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !shown || still) return

    video.play().catch(() => {})
  }, [shown, still])

  return (
    // `svh`, not `dvh`: the rail is pinned to the bottom of the fold, and on a
    // phone `dvh` would drag it up and down as the browser chrome slides.
    <section
      ref={ref}
      // 92svh, not a full 100: enough off the top that the fold does not claim the
      // whole screen and the section under it shows its first line, but not so much
      // that the pack loses the scale the film was cut for. 80 was too little — it
      // read as a band rather than a fold.
      className="relative isolate overflow-hidden bg-ink-950 text-white xl:min-h-[92svh]"
    >
      {/* In flow below `xl`, where a 16:9 crop of a tall viewport would throw
          most of the mechanism away. The fold's own field above it. */}
      <video
        ref={videoRef}
        className={cn(
          'w-full origin-center',
          // Cover at every ratio, so the film fills the fold instead of leaving
          // ink-950 bars at the edges. There used to be a `contain` fallback past
          // 16:9 to stop cover cropping the frame's height, but a fitted film
          // leaves the fold part black, and the fold is meant to be the film.
          //
          // Flush left, not centred. Every frame of the master has hardware
          // touching its left edge and near-black at its right, so a centred
          // crop eats the fork tubes on a 16:10 window and gains nothing: all
          // the overflow is worth taking off the right. 42% vertically keeps the
          // pack's lid inside the frame on a short window.
          'xl:absolute xl:inset-0 xl:size-full xl:object-cover xl:object-[0%_42%]',
          // A slow settle out of a 4% push-in, the same vocabulary as the hero's
          // stills. One event, not a loop of them.
          'transition-transform duration-[1600ms]',
          EASE,
          shown ? 'scale-100' : 'scale-[1.04]',
        )}
        src="/videos/battery-dark.mp4"
        poster="/videos/battery-dark-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        // Silent and wordless, so it carries no dialogue to caption. It
        // stands in for a photograph of the mechanism.
        role="img"
        aria-label="The battery pack lifting out of a Revolt RV400 frame cradle"
      />

      {/* Base fade only, and only at overlay widths, where the rail sits on the
          film. The left-to-right side wash went with the heading it was there to
          keep legible: with nothing set over the film it only blacked out the
          right third of the frame the crop now fills. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-64 xl:block"
        style={{
          backgroundImage:
            'linear-gradient(to top, #050505 14%, rgba(5,5,5,0.6) 52%, rgba(5,5,5,0))',
        }}
      />

      {/* The rail holds the bottom of the fold on its own — there is no heading and
          no paragraph over the film. */}
      {/* The rail is pinned to the bottom, so its distance from the base of the
          fold is set by this padding alone — `pb-6` at overlay widths sits it lower
          on the film than the 14 it started with, close enough to the edge to read
          as the film's base line rather than a row floating above it. */}
      <div className="relative flex flex-col justify-end pt-12 pb-10 xl:min-h-[92svh] xl:pt-28 xl:pb-6">
        {/* One rule across the whole fold rather than one under every figure —
            it is the base line the film stands on. */}
        <Container>
          <div className="border-t border-white/15 pt-7">
            {/* Two columns on a phone, not three: these values are words and not
                just numbers — "Portable battery" needs ~150px at the base size and
                a third of a 375px screen is 103px. Five figures over two columns
                leaves the last one alone on its row, so it spans both rather than
                reading as a stray.

                Centred, and each figure centred in its own place: with no link at
                the far end there is nothing for the row to be flush left against,
                and the five of them measured 1088 of the container's ~1100 — set
                left they read as a row that had been pushed rather than placed.
                The wider gaps at `sm` come out of the slack the smaller figure size
                left; `justify-center` on a wrapping flex row also keeps a short
                last line under the middle of the row above it. */}
            <dl className="grid grid-cols-2 gap-x-8 gap-y-8 text-center [&>*:last-child]:col-span-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-16 sm:gap-y-8 sm:[&>*:last-child]:col-span-1">
              {FIGURES.map((figure, i) => (
                <div
                  key={figure.label}
                  className={cn(
                    'transition-[transform,opacity] duration-700',
                    EASE,
                    shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                  )}
                  // The stagger used to wait out three masked heading lines ahead
                  // of it. With no heading the figures arrive first, so the
                  // lead-in comes off. 50ms a step rather than 70, because there
                  // are five of them now and the rail should not take half a
                  // second to finish arriving.
                  style={{ transitionDelay: shown ? `${120 + i * 50}ms` : '0ms' }}
                >
                  {/* No `whitespace-nowrap` any more: tracked out to 0.18em,
                      "FAST CHARGING (0–80%)" is ~200px at 11px, wider than a
                      column of a 375px screen, so it has to be allowed to wrap.
                      Two lines' worth of height is reserved for every label
                      instead, so a wrapped one cannot push its own figure out of
                      line with the one beside it. The flex row at `sm` puts each
                      figure on its own baseline and does not need the floor. */}
                  <dt className="min-h-[2.4em] text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60 sm:min-h-0 sm:text-[11px]">
                    {figure.label}
                  </dt>
                  {/* 18px at the base step and 24 above it, not 30: the values are
                      words now, and "Portable battery" measures ~250px at 30px —
                      wider than the space five figures and the link have to share
                      on a 1280 window. */}
                  <dd className="mt-2 font-display text-lg font-bold tabular-nums text-white sm:text-2xl">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </div>
    </section>
  )
}
