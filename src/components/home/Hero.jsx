import { useEffect, useRef, useState } from 'react'
import FilmDialog from '@/components/home/FilmDialog'
import { ChevronRight } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

/**
 * Full-bleed hero: the film plays on its own loop and nothing advances past it
 * unless a visitor picks one of the stills from the rail on the right.
 * Every asset lives in `public/` — they are large binaries, so they stay out of
 * the bundle graph and get served directly. The stills are ~100 KB WebP; re-run
 * that step if any of them is replaced.
 *
 * FULL FRAME, WEB BITRATE. `rvx-3d.mp4` is the RVX 3D product video at its
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
    src: '/videos/rvx-3d.mp4',
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
  // The uncropped film, in a box. See [[FilmDialog]] — the hero's own crop is
  // right for a background and wrong for anybody who wants to watch the thing.
  const [film, setFilm] = useState(false)
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

    if (index === 0 && !still && !film) {
      video.currentTime = FILM_START
      video.play().catch(() => {})
    } else {
      // The dialog counts: two copies of one file playing at once is two
      // decoders on a phone, and the one behind the backdrop is not being
      // watched by anybody.
      video.pause()
    }
  }, [index, still, film])

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
      {index === 0 ? (
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
