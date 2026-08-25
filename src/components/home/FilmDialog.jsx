import { useEffect, useRef } from 'react'
import { getLenis } from '@/utils/lenis'
import { cn } from '@/utils/cn'

/**
 * The hero film, uncropped, in a box.
 *
 * The hero is a full-bleed 16:9 file in a `min-h-svh` frame, which on a phone
 * held upright is a portrait window onto a landscape shot: `object-cover` keeps
 * the middle third and throws away both ends of every composition. That is the
 * right call for a background — a contained film in a full-height section
 * letterboxes into two thick black bands — but it means a visitor on a phone
 * never sees the film the way it was cut.
 *
 * So the crop stays, and the whole frame is one tap away. The dialog holds a
 * 16:9 box on a dark ground with `object-contain` inside it, which is small on
 * a phone and correct: every pixel of the frame is there, which is the entire
 * point, and a small complete picture beats a large amputated one.
 *
 * A NATIVE `<dialog>`, opened with `showModal`. Escape, the backdrop, the focus
 * trap, the inert page behind it and the top-layer stacking are all the
 * platform's — a hand-rolled overlay reimplements four of those and usually
 * gets the fourth wrong. What is left to do here is the film itself and Lenis.
 *
 * ITS OWN `<video>`, not the hero's moved into it. Moving a playing element
 * between two parents in React means unmounting it, which drops the buffer and
 * restarts the download. Two elements pointing at one URL is one download: the
 * file is in the HTTP cache by the time anybody presses the button.
 *
 * WITH SOUND. The hero runs the same file silent, because a background loop
 * should. This is not a background — somebody pressed a button asking to watch
 * it — so it carries the browser's own controls and comes up with the audio on.
 *
 * Which means the encode has to keep its audio track. It is muted by an
 * attribute over there, not stripped by ffmpeg; see the note on the recipe in
 * [[Hero]], because a `-an` in it makes this dialog silent with nothing here to
 * show why.
 *
 * Sound is allowed here only because of that press. Autoplay with audio is
 * blocked everywhere unless the page has been "activated" by a user gesture,
 * and opening this dialog is exactly that. It is still not a promise: the
 * activation can be missing on a cold load with a stricter policy, or the
 * device can be under a hardware mute switch, so the play is attempted unmuted and
 * falls back to muted-and-playing rather than to not playing at all. A silent
 * film the reader can unmute beats a black box with a blocked play behind it.
 */
export default function FilmDialog({ open, onClose, src, poster }) {
  const dialog = useRef(null)
  const video = useRef(null)

  useEffect(() => {
    const node = dialog.current
    if (!node) return

    if (open) {
      node.showModal()

      // Lenis drives the page's scroll from a window listener, and a modal
      // dialog does not stop that: the body would still glide under the
      // backdrop. `stop` parks it until the dialog closes.
      getLenis()?.stop()

      // Unmuted first. If the policy refuses, the promise rejects and nothing
      // has played yet — so mute and go again, which is always allowed.
      const element = video.current
      if (element) {
        element.muted = false
        element.play().catch(() => {
          element.muted = true
          element.play().catch(() => {})
        })
      }
    } else if (node.open) {
      node.close()
    }
  }, [open])

  // One place to undo everything, so Escape and the backdrop and the close
  // button all leave the same state behind. `close` fires for all three.
  const handleClose = () => {
    getLenis()?.start()

    const element = video.current
    if (element) {
      element.pause()
      element.currentTime = 0
      element.muted = true
    }

    onClose()
  }

  return (
    <dialog
      ref={dialog}
      onClose={handleClose}
      // The backdrop is a click target in its own right, and a press that lands
      // on the dialog element itself — rather than on anything inside it — is a
      // press on the backdrop.
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close()
      }}
      className={cn(
        'w-full max-w-none bg-transparent p-4 text-white sm:p-6 lg:p-10',
        'backdrop:bg-ink-950/92 backdrop:backdrop-blur-sm',
        // A dialog is centred by margin, not by flex — it is in the top layer
        // and has no flow parent to align it against.
        'm-auto',
      )}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-baseline justify-between gap-6 pb-3">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">
            Full frame
          </p>

          {/* Type, not a glyph. An × on a black screen is a guess; the word is
              the same size as the label opposite it and reads as a control. */}
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className={cn(
              'text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase',
              'transition-colors duration-300 hover:text-white',
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
            )}
          >
            Close <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {/* The box. Fixed at the film's own ratio so the frame is complete at
            every width and nothing shifts while it loads. */}
        <div className="aspect-video w-full overflow-hidden bg-black ring-1 ring-white/15">
          <video
            ref={video}
            src={src}
            poster={poster}
            className="size-full object-contain"
            controls
            muted
            playsInline
            preload="none"
          />
        </div>

        <p className="mx-auto mt-4 max-w-[52ch] text-center text-[13px] leading-relaxed text-white/45">
          The hero crops this film to fill the screen and runs it silent. This is the whole frame,
          with sound.
        </p>
      </div>
    </dialog>
  )
}
