import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

/**
 * Full-bleed hero: the film plays on its own loop and nothing advances past it
 * unless a visitor picks one of the stills from the rail on the right.
 * Every asset lives in `public/` — they are large binaries, so they stay out of
 * the bundle graph and get served directly. The video master (600 MB, 1080p
 * 50 Mbps) is transcoded to 720p ~1 Mbps and the stills to ~100 KB WebP;
 * re-run those steps if any of them is replaced.
 */
// `position` is the object-position of the crop. Below 50% the window sits
// higher in the frame, so the rider's helmet clears the navbar instead of
// being cut by the top edge, and the surplus tarmac goes off the bottom.
const SLIDES = [
  {
    type: 'video',
    src: '/videos/hero.mp4',
    poster: '/videos/hero-poster.jpg',
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
      video.currentTime = 0
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [index, still])

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
            autoPlay
            muted
            loop
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
