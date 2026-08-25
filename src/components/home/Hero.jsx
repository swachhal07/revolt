import { useEffect, useRef, useState } from 'react'
import FilmDialog from '@/components/home/FilmDialog'
import { ChevronRight } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

/**
 * Full-bleed hero: the film plays on its own loop and nothing advances past it
 * unless a visitor picks one of the stills from the rail on the right.
 * Every asset lives in `public/` — they are large binaries, so they stay out of
 * the bundle graph and get served directly. Three of the stills are ~100 KB
 * WebP; re-run that step if any of them is replaced. The fourth is a 1.9 MB PNG
 * held at its supplied quality on request — see the note on it below.
 *
 * FULL FRAME, WEB BITRATE. `nepal-garcha.mp4` is the Nepal Garcha Revolt film at
 * its native 1920x1080 / 30 fps, re-encoded from the master's 15.4 Mbps at CRF
 * 21.5. The resolution is untouched, so the crop below has every pixel the
 * master had.
 *
 * CRF 21.5 IS THE CEILING, and it is set by the blob limit rather than by taste.
 * At this length the same encode measures roughly 86 MiB at CRF 22, 95 at 21.5
 * and 101 at 21 — so 21 is already over. Do not lower the number without
 * re-measuring; and measure in MiB, because that is the unit the limit is in and
 * PowerShell's `1MB` is a MiB, which makes the two easy to conflate.
 *
 * THE SOURCE IS THE REAL LIMIT ON QUALITY, not the bitrate. The film this
 * replaced was a 2560x1440 master; this one is 1080p, and the hero scales its
 * source *up* on any display wider than the video — 1.33x on a 2560 screen, and
 * harder than that on a phone, where `object-cover` crops to the middle band and
 * enlarges it. No encoder setting recovers pixels the master never had. If a
 * 1440p or 4K cut of this film turns up, replacing the master is worth more than
 * anything that can be done here.
 *
 * THE AUDIO TRACK STAYS, even though this element mutes it. [[FilmDialog]] plays
 * the same URL with the sound on, and it is the same file by design — two
 * elements pointing at one URL is one download. Strip the audio to save the
 * ~2 MB and the full-frame dialog silently has nothing to play.
 *
 * The size matters more than the ratio it came down by. It has to sit under
 * GitHub's 100 MiB blob limit, which is the whole reason it can live in the repo
 * rather than on a host, and at 95 MiB there is about 5 MiB of room left. Over
 * the limit the push is rejected outright, and Git LFS is not a way around it:
 * Vercel clones without resolving LFS and would deploy the pointer file, serving
 * 130 bytes of text as an MP4.
 *
 * The master is `src/assets/images/Nepal Garcha Revolt.mp4` — 222 MB, gitignored
 * and local-only. To regenerate this file and its poster from it:
 *
 *   ffmpeg -i "src/assets/images/Nepal Garcha Revolt.mp4" \
 *     -c:v libx264 -preset slower -crf 21.5 -pix_fmt yuv420p \
 *     -c:a aac -b:a 128k \
 *     -movflags +faststart public/videos/nepal-garcha.mp4
 *   ffmpeg -ss 3 -i "src/assets/images/Nepal Garcha Revolt.mp4" \
 *     -frames:v 1 -q:v 4 public/videos/nepal-garcha-poster.jpg
 *
 * The poster is lifted at 3s rather than 0s: the film fades up from black, so
 * frame zero is a black rectangle and would show as one for as long as the video
 * takes to start.
 */
// `position` is the object-position of the crop. Below 50% the window sits
// higher in the frame, so the rider's helmet clears the navbar instead of
// being cut by the top edge, and the surplus tarmac goes off the bottom.
const SLIDES = [
  {
    type: 'video',
    src: '/videos/nepal-garcha.mp4',
    poster: '/videos/nepal-garcha-poster.jpg',
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

// The two step controls, as a constant rather than two inline literals: they are
// the same button mirrored, and writing it twice is how the two drift apart.
const CONTROLS = [
  { dir: -1, label: 'Previous slide', side: 'left-6 lg:left-10', flip: true },
  { dir: 1, label: 'Next slide', side: 'right-6 lg:right-10', flip: false },
]

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
      // From the top, so stepping back onto the film opens on its first shot
      // rather than resuming wherever it was paused mid-scene.
      video.currentTime = 0
      video.play().catch(() => {})
    } else {
      // The dialog counts: two copies of one file playing at once is two
      // decoders on a phone, and the one behind the backdrop is not being
      // watched by anybody.
      video.pause()
    }
  }, [index, still, film])

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
            // The native attribute, now that the film is played from its own
            // first frame. It used to be hand-rolled off `ended`, because the
            // previous file opened on twelve seconds of logo sting that the loop
            // had to skip and `loop` can only wrap to zero. This one has no
            // sting, so zero is where it is supposed to wrap to — and the browser
            // wraps seamlessly where a JS seek drops a frame at every join.
            loop
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
      {CONTROLS.map((control) => (
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
