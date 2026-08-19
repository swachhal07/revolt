import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from '@/components/ui/icons'
import { HERO_FILM_SRC } from '@/constants/media'
import { cn } from '@/utils/cn'

/**
 * Full-bleed hero: the film plays on its own loop and nothing advances past it
 * unless a visitor picks one of the stills from the rail on the right.
 * The stills live in `public/` — they are large binaries, so they stay out of
 * the bundle graph and get served directly. They are ~100 KB WebP; re-run that
 * step if any of them is replaced.
 *
 * THE FILM IS THE MASTER, NOT A WEB CUT. `rvx-3d.mp4` is the RVX 3D product
 * video copied in byte-for-byte on request: 2560x1440, 30 fps, 10 Mbps, 2:12
 * long, 173 MB. That is roughly fifteen times the weight of the 720p ~1 Mbps
 * cut it replaced, and it is the first thing the home page asks a visitor to
 * download. It carries an audio track too, which the element mutes.
 *
 * Being 173 MB it cannot be committed, so unlike every other asset here it is
 * hosted rather than deployed — see `@/constants/media` for where it resolves
 * from and what has to be set for production to find it.
 *
 * If it is ever allowed to be transcoded, this is the step — same frame, same
 * cut, web bitrate, moov atom in front. It lands around 15 MB, which is small
 * enough to commit and would let the hosting go away entirely:
 *
 *   ffmpeg -i "src/assets/images/RVX 3D_Product_Video.mp4" \
 *     -vf scale=1280:-2 -c:v libx264 -preset slow -crf 24 \
 *     -an -movflags +faststart public/videos/rvx-3d.mp4
 */
// `position` is the object-position of the crop. Below 50% the window sits
// higher in the frame, so the rider's helmet clears the navbar instead of
// being cut by the top edge, and the surplus tarmac goes off the bottom.
const SLIDES = [
  {
    type: 'video',
    src: HERO_FILM_SRC,
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
]

// The film opens on twelve seconds of logo sting: a glowing mark, the wordmark
// resolving at 8.2s, then the mark again in dark relief from ~11.5s before the
// first bike shot lands around 14s. The hero starts on that last mark, so the
// brand reads for a beat and the product arrives a second and a half later
// instead of five. Every seek in this component goes here, the loop included:
// `loop` on the element would wrap to zero and replay the whole sting.
const FILM_START = 12

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [still, setStill] = useState(false)
  const videoRef = useRef(null)

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

    if (index === 0 && !still) {
      video.currentTime = FILM_START
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [index, still])

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
            autoPlay
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

      {/* Step controls, pinned to the edges and out of the composition's way.
          Glass, not a filled disc — the footage stays readable through them.
          Nothing rotates on its own: the film loops until a visitor steps off
          it. */}
      {[
        { dir: -1, label: 'Previous slide', side: 'left-6 lg:left-10', flip: true },
        { dir: 1, label: 'Next slide', side: 'right-6 lg:right-10', flip: false },
      ].map((control) => (
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
    </section>
  )
}
