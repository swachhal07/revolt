import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { formatNpr } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * The price, revealed once — the beat between the countdown running out and the
 * film starting.
 *
 * It runs once per page load and cannot be scrolled back up to: still a moment
 * rather than a place, but a moment a reload is allowed to repeat. See
 * `revealOwed` in [[Hero]], which decides when it is owed — the gate lifting in
 * front of somebody, or simply being past launch.
 *
 * Repeating it is a load-bearing choice, not a convenience. These figures live
 * nowhere else: the show offer is not the machine's standing price and the
 * catalogue has no field for it, so while the RVX's own `priceNpr` is null this
 * is the only place on the site the price is printed at all. A visitor who
 * refreshed used to lose it with no way back.
 *
 * Drawn in the gate's language — mono, hairlines, one red accent, no rounded
 * corners, scanlines over black — because to the visitor this *is* the gate
 * finishing its sentence. What is new is the scale: the gate's clock was the
 * biggest thing the site had ever set, and this has to be its equal or the
 * handover reads as a step down.
 *
 * THE MECHANISM. It does not list prices, it *runs* one down. The MRP arrives
 * first, at full size and alone; a red stroke crosses it; it clears, and the
 * offer lands in the same slot with the odometer falling from the struck figure
 * to the real one, where it locks with a stamp. A price that ticks is a price
 * being cut in front of you, which no arrangement of two static numbers can be.
 *
 * ONE AXIS, DELIBERATELY. Everything is centred on a single spine and the sizes
 * carry the hierarchy. A left-anchored, rail-and-chassis version of this screen
 * was tried — the gate's own architecture, carried through literally — and it was
 * worse: at this scale and for this long, the panel furniture competed with the
 * figure it was supposed to frame. What the visitor has four seconds to read is
 * one number, and the composition that says so loudest is the one with nothing
 * beside it.
 *
 * The count is a GSAP timeline rather than staged React state, and that is
 * load-bearing: the counter writes glyphs straight to the DOM sixty times a
 * second, and putting that through `setState` would re-render this subtree on
 * every frame of it, over a video that is buffering underneath. React owns the
 * structure here; GSAP owns the frames. Same division the rest of the site
 * makes — see [[useScrollReveal]].
 */

// Borrowed verbatim from the gate. The two screens have to agree on a hairline
// weight and a micro scale, and the way they agree is by being written to the
// same two values.
const RULE = 'border-white/25'
const MICRO = 'text-[10px] uppercase leading-none tracking-[0.3em] sm:text-[11px]'

// How long the figure spends falling, and how long the offer holds alone before
// the screen dissolves into the film. The count is the one duration worth tuning
// by feel: under a second it is a glitch, over two it is a progress bar.
const COUNT = 1.6
const SETTLE = 1.9
const FADE = 0.6

/**
 * The width of one odometer cell, by what it holds.
 *
 * Only the glyphs that *change* need a fixed box, and they are the digits.
 * `w-[1ch]` is what stops the figure shuffling sideways as it counts: Chakra
 * Petch's figures are not uniform-width and it carries no `tnum` feature for
 * `tabular-nums` to switch on, so a 1 taking the place of a 4 narrows the row —
 * and because the row is centred, both halves of it move. One `ch` is by
 * definition the advance of a zero, so every digit sits in an identical cell and
 * the width is fixed whatever it reads. The gate's clock does the same thing for
 * the same reason.
 *
 * Punctuation gets a tighter box, because a comma centred in a full `1ch` cell
 * reads as a gap in the number.
 *
 * Letters get NO box at all: nothing about the `Rs.` prefix changes as the
 * counter runs, so there is nothing to hold still, and forcing it into narrow
 * cells is what made the glyphs sit on top of each other.
 */
/**
 * A formatted price, split at the space between the currency and the number.
 *
 * Off `formatNpr` rather than a second formatter, so there is still exactly one
 * place on the site that decides how money is written; this only takes it apart
 * so the two halves can be set at different sizes.
 */
const splitNpr = (amount) => {
  const printed = formatNpr(amount)
  const seam = printed.lastIndexOf(' ')
  return seam < 0
    ? { currency: '', digits: printed }
    : { currency: printed.slice(0, seam), digits: printed.slice(seam + 1) }
}

const cellWidth = (glyph) => {
  if (/\d/.test(glyph)) return 'w-[1ch]'
  if (glyph === ',') return 'w-[0.42ch]'
  if (glyph === '.') return 'w-[0.36ch]'
  if (glyph === ' ') return 'w-[0.32ch]'
  return null
}

/**
 * A price, set as a figure rather than as a line of text.
 *
 * The currency is subordinated: a third of the digits' size and held at less than
 * full white. `Rs.` was taking the visual weight of two numerals, which on a
 * figure this large is a third of the number — and it is the one part of it
 * nobody needs to read. What is left is mass where the information is.
 *
 * It sits on the digits' optical middle rather than their cap line. Raised to the
 * cap it read as a superscript — detached, floating off the top corner of the
 * figure, which is a footnote's position and not a currency's. Centred, it reads
 * as part of the same object.
 *
 * The split comes off `formatNpr` rather than a second formatter, so there is
 * still one place that decides how money is written on this site: the string it
 * returns is `Rs. 3,99,000`, and the space is the seam.
 *
 * Pass `cellsRef` to make it an odometer — the timeline writes glyphs into those
 * cells directly. Without it the same component sets a static figure, which is
 * what the MRP needs, and is why the two figures are typographically identical.
 */
function Figure({ amount, className, cellsRef, pad = 0 }) {
  const { currency, digits } = splitNpr(amount)
  const cellText = digits.padStart(pad, ' ')

  return (
    <span className={cn('flex items-center justify-center gap-[0.16em]', className)} aria-hidden="true">
      {/* Centred by `items-center` on the row, then nudged down a hair: the
          digits' line box is set to 0.85 and sits high inside its own em, so
          geometric centre lands a touch above the numerals' optical middle. The
          offset is in `em` of this span, so it holds at every step of the clamp. */}
      <span className="translate-y-[0.06em] text-[0.32em] leading-none tracking-[0.04em] text-white/65">
        {currency}
      </span>

      <span className="flex">
        {cellText.split('').map((glyph, i) => (
          <span
            key={i}
            ref={(node) => {
              if (cellsRef) cellsRef.current[i] = node
            }}
            className={cn('inline-block text-center', cellWidth(glyph))}
          >
            {glyph}
          </span>
        ))}
      </span>
    </span>
  )
}

export default function PriceReveal({ bike, rungs, still, onDone }) {
  const root = useRef(null)
  const cells = useRef([])
  const [leaving, setLeaving] = useState(false)

  // First rung is what it costs, last is what it is being sold for. Anything
  // between them is ignored: the count only has a start and an end.
  const list = rungs[0]
  const offer = rungs[rungs.length - 1]
  const saving = list.amount - offer.amount

  // The count runs between two digit strings of identical length, so the cells
  // never have to be rebuilt mid-flight. Both figures come off the same
  // formatter, so this holds for any pair in the same order of magnitude; the pad
  // covers the pair that is not — a seven-figure list price against a six-figure
  // offer. The currency is outside the cells now, so it is outside this too.
  const width = Math.max(splitNpr(list.amount).digits.length, splitNpr(offer.amount).digits.length)
  const frame = (amount) => splitNpr(amount).digits.padStart(width, ' ')

  useGSAP(
    () => {
      const write = (amount) => {
        const glyphs = frame(amount)
        // Cheaper than re-rendering, and cheaper than `textContent` on the
        // parent: only the cells whose glyph actually changed are touched, which
        // on a decrementing counter is the last three or four of them.
        for (let i = 0; i < glyphs.length; i += 1) {
          const cell = cells.current[i]
          if (cell && cell.textContent !== glyphs[i]) cell.textContent = glyphs[i]
        }
      }

      // Reduced motion gets the outcome, immediately: the offer at its landing
      // figure and nothing in flight. Everything here starts visible in CSS, so
      // there is nothing to reveal — the only work is to settle the odometer on
      // the final number and take the MRP out of the slot it shares with the
      // offer, since with no sequence to separate them they would otherwise
      // print on top of each other.
      //
      // The dwell is the same length as the animated version's. What is lost is
      // the travel, which is the part that would make somebody ill, not the part
      // that carries the information.
      if (still) {
        write(offer.amount)
        gsap.set('[data-part="list"]', { opacity: 0 })
        gsap.delayedCall(SETTLE + 1, () => setLeaving(true))
        gsap.delayedCall(SETTLE + 1 + FADE, onDone)
        return
      }

      write(list.amount)

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // The name's width is only known once it has laid out, so the scan's
      // travel is read at the moment the tween starts rather than baked in when
      // the timeline is built — a function value, which GSAP re-evaluates on
      // every render of that tween.
      const nameWidth = () => root.current?.querySelector('[data-name]')?.offsetWidth ?? 0

      // ── The panel identifies itself ──────────────────────────────────
      // Typed, character by character, with no movement — movement at 10px is
      // noise. `ease: 'none'` is deliberate: a typewriter is mechanical, and an
      // eased stagger reads as a wave passing through the word.
      tl.from('[data-tagchar]', { opacity: 0, duration: 0.01, stagger: 0.05, ease: 'none' })

        // ── The name, struck into place ──────────────────────────────────
        // Each letter is driven up from below the line box and masked by it, so
        // it arrives from nowhere rather than fading in position. `power4.out`
        // and a longer stagger than before: at this size the letters need to be
        // seen landing separately, and the previous 0.045s put all three inside
        // a tenth of a second — which is why it read as static.
        .from(
          '[data-letter]',
          { yPercent: 115, duration: 0.7, stagger: 0.11, ease: 'power4.out' },
          '-=0.15',
        )
        // The accent crosses the word as the last letter settles.
        .fromTo(
          '[data-scan]',
          { x: -8, opacity: 0.9 },
          { x: nameWidth, opacity: 0, duration: 0.5, ease: 'power2.inOut' },
          '-=0.35',
        )
        // And the word ignites: two dropped frames, which is what a plate lit by
        // a tube does before it holds. Cheap — opacity only — and over in a third
        // of a second, so it registers as a flicker rather than as a blink.
        .to(
          '[data-name]',
          {
            keyframes: { opacity: [1, 0.35, 1, 0.65, 1] },
            duration: 0.32,
            ease: 'none',
          },
          '-=0.2',
        )

        // ── What it costs, at full size and alone ────────────────────────
        // The MRP is the only figure on screen at this point, and it is set as
        // large as the offer will be. It has to be read as *the* price before
        // anything happens to it — a number that is undercut a quarter of a
        // second after it appears was never really quoted.
        .from('[data-part="list"]', { opacity: 0, y: 16, duration: 0.55 }, '-=0.2')

        // ── The cut ──────────────────────────────────────────────────────
        // A beat to read it, then the slash — fast, and accelerating into the
        // figure rather than out of it, which is what makes it a stroke.
        .to('[data-slash]', { scaleX: 1, duration: 0.28, ease: 'power2.in' }, '+=0.9')

        // Struck, then gone: it collapses slightly as it goes, so the screen
        // reads as being cleared for something rather than as a fade.
        .to(
          '[data-part="list"]',
          { opacity: 0, scale: 0.93, duration: 0.45, ease: 'power2.inOut' },
          '+=0.45',
        )

        // ── And then the offer ───────────────────────────────────────────
        // It lands in the slot the MRP just vacated, and the odometer starts
        // from the MRP's own figure — so the first thing the new number does is
        // fall away from the one that was struck.
        .from('[data-part="offer"]', { opacity: 0, y: 26, scale: 0.86, duration: 0.6 }, '-=0.15')
        .to(
          { value: list.amount },
          {
            value: offer.amount,
            duration: COUNT,
            // Dumps most of the distance immediately and crawls the last few
            // thousand — the shape of a number being driven down rather than
            // interpolated between two points.
            ease: 'expo.out',
            onUpdate() {
              write(Math.round(this.targets()[0].value))
            },
          },
          '<0.1',
        )

        // ── The lock ─────────────────────────────────────────────────────
        // A short overshoot on the landing frame. This is the stamp, and it is
        // the only place in the sequence anything moves against its ease.
        .to('[data-part="offer"]', { scale: 1.06, duration: 0.12, ease: 'power2.out' })
        .to('[data-part="offer"]', { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.55)' })
        // One pulse of the brand red behind the figure, gone in half a second.
        // Depth from light rather than from a panel, which is how the rest of
        // the site draws on black.
        .fromTo(
          '[data-glow]',
          { opacity: 0, scale: 0.5 },
          { opacity: 0.55, scale: 1.35, duration: 0.5, ease: 'power2.out' },
          '<',
        )
        .to('[data-glow]', { opacity: 0, duration: 0.7 }, '>-0.2')
        // The offer's name resolves out of wide tracking as it arrives — the
        // typographic equivalent of a lens pulling focus — and the rules draw
        // outward from it, away from the label, so the plate reads as being
        // fixed on rather than assembled.
        .from(
          '[data-part="badge"]',
          { opacity: 0, letterSpacing: '0.9em', duration: 0.7, ease: 'power4.out' },
          '<0.05',
        )
        .from('[data-badge-rule]', { scaleX: 0, duration: 0.55 }, '<0.15')
        // The saving wipes open from its centre rather than fading: a filled
        // block that fades in reads as a panel loading, and one that opens reads
        // as a stamp being applied. Its text follows a beat later, so the block
        // lands first and the words arrive in it.
        .from('[data-part="saving"]', { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, '<0.2')
        .from('[data-part="savingText"]', { opacity: 0, duration: 0.3 }, '>-0.12')
        .from('[data-part="where"]', { opacity: 0, duration: 0.5 }, '<0.1')

        // ── Handing over to the film ─────────────────────────────────────
        .call(() => setLeaving(true), null, `+=${SETTLE}`)
        .call(onDone, null, `+=${FADE}`)
    },
    { scope: root, dependencies: [rungs, still, onDone] },
  )

  return (
    <div
      ref={root}
      // `status` rather than `alert`: information arriving, not a problem. The
      // label carries the sentence a reader needs and nothing the animation is
      // doing — a live counter announced digit by digit would be unusable.
      role="status"
      aria-label={`${bike.name} now launched. ${offer.label}: ${formatNpr(offer.amount)}, down from ${list.label.toLowerCase()} ${formatNpr(list.amount)}. Ex-showroom, Kathmandu.`}
      className={cn(
        'absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden',
        'bg-ink-950 px-6 font-mono text-white',
        'transition-opacity duration-[600ms] ease-linear',
        leaving && 'pointer-events-none opacity-0',
      )}
    >
      {/* The gate's own texture, at half the strength it has there. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 scanlines opacity-35" />

      {/* Full width and centred on both axes, with nothing carrying its own
          alignment: `max-w-5xl` used to cap this, which on a wide screen left the
          block centred inside a box rather than in the viewport. The chassis rule
          at the bottom is absolute, so it does not pull the stack off centre. */}
      <div
        aria-hidden="true"
        className="relative mx-auto flex w-full flex-col items-center text-center"
      >
        {/* Typed rather than faded in, one character at a time. It is the first
            thing on the screen and it is set at 10px — a fade at that size is
            over before it registers, whereas type arriving under a cursor is
            unmistakably *happening*, and it is the idiom the gate's terminal
            rails already established. */}
        <p className={cn(MICRO, 'flex items-center gap-2.5')}>
          <span className="flex">
            {'Now launched'.split('').map((glyph, i) => (
              <span key={i} data-tagchar className="inline-block whitespace-pre">
                {glyph}
              </span>
            ))}
          </span>
          <span className="animate-blink text-[9px] text-brand-600">■</span>
        </p>

        {/* The model, bigger than anything else on the site bar the gate's clock.
            Chakra Petch through `font-plate`, for the reason that clock uses it:
            the body face goes flat above about 4rem and type this large wants
            angles.

            `relative` and `overflow-hidden` together are what make the entrance
            work: the letters travel up from outside the line box and are masked
            by it, so they are struck into place rather than sliding into view,
            and the scan bar that crosses them afterwards is clipped to the word
            instead of running the width of the screen. */}
        <h2
          data-name
          className="relative mt-7 flex justify-center overflow-hidden font-plate text-[clamp(3.5rem,17vw,10.5rem)] leading-[0.82] font-bold tracking-[-0.03em]"
        >
          {bike.name.split('').map((letter, i) => (
            <span key={i} data-letter className="inline-block">
              {letter}
            </span>
          ))}

          {/* One pass of the accent across the name, on the beat the last letter
              lands. A hairline of red travelling over white type reads as a head
              sweeping across a plate — the same machine idiom as the scanlines
              behind it, but moving. */}
          <span
            data-scan
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[6px] bg-brand-600 opacity-0"
          />
        </h2>

        {/* ONE SLOT, TWO FIGURES. Both blocks are placed in the same grid cell,
            so the offer arrives exactly where the MRP was struck rather than
            below it — and because they overlap instead of stacking, nothing on
            the screen moves when the first one leaves. A column would have had
            to collapse the MRP's height mid-sequence, which is a layout
            animation, which is a jank you can see.

            The cell is as tall as the taller of the two, which is the offer. */}
        {/* `items-start`, not `place-items-center`, and that is what closes the
            gap under the name: the cell is as tall as the taller block (the
            offer, which carries a saving line the MRP does not), so centring the
            two inside it pushed the shorter one down and left a hole where the
            eye expects the price. Aligned to the top of the cell, both labels
            start on the same line and both figures land on the same baseline —
            which is what a swap in one slot should look like. */}
        <div className="mt-8 grid w-full items-start justify-items-center">
          {/* What it costs. Set at the same scale the offer will be: it is the
              price until the moment it isn't. */}
          <div data-part="list" className="col-start-1 row-start-1 flex flex-col items-center">
            <span className={cn(MICRO, 'text-white/45')}>{list.label}</span>
            <span className="relative mt-6 block">
              <Figure
                amount={list.amount}
                pad={width}
                className="font-plate text-[clamp(2.5rem,12vw,8rem)] leading-[0.85] font-bold tracking-[-0.02em] text-white/80"
              />
              {/* The slash, drawn as a scaling rule rather than `line-through`:
                  a text decoration cannot be animated, and a cut that simply
                  appears has none of the gesture of one being drawn. Thicker
                  than a hairline because it is crossing type this large. */}
              <span
                data-slash
                className="pointer-events-none absolute inset-x-[-0.04em] top-1/2 h-[4px] origin-left -translate-y-1/2 scale-x-0 bg-brand-600 sm:h-[6px]"
              />
            </span>
          </div>

          {/* And then the offer. Everything above exists to hand over to this. */}
          <div
            data-part="offer"
            className="relative col-start-1 row-start-1 flex flex-col items-center"
          >
            {/* The pulse, behind the figure and sized off it. Pure light — no
                border, no panel — so it reads as the number igniting rather
                than as a box appearing behind it. */}
            <span
              data-glow
              className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[42rem] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 opacity-0"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(193,27,33,0.55), rgba(193,27,33,0.12) 45%, transparent 70%)',
              }}
            />

            {/* The label, flanked by two short rules that draw outward from it.
                Floating on its own it was a caption that happened to sit above a
                number; ruled, it is a plate fixed *to* the number — and the rules
                give the timeline something to open with rather than one more
                thing to fade. */}
            <span data-part="badge" className="flex items-center gap-4 sm:gap-5">
              <span data-badge-rule className="block h-px w-8 origin-right bg-brand-600/70 sm:w-14" />
              <span className={cn(MICRO, 'text-center font-semibold text-brand-600')}>
                {offer.label}
              </span>
              <span data-badge-rule className="block h-px w-8 origin-left bg-brand-600/70 sm:w-14" />
            </span>

            {/* The largest thing on the site, and it should be: the whole
                sequence exists to arrive at this figure. The `vw` term is held
                below the point where the glyphs would reach the padding on a
                360px phone — the clamp's ceiling is what does the growing. */}
            <Figure
              amount={list.amount}
              pad={width}
              cellsRef={cells}
              className="mt-5 font-plate text-[clamp(2.75rem,13.5vw,9.5rem)] leading-[0.85] font-bold tracking-[-0.02em]"
            />

            {/* The saving, and the only filled element on the screen.
                It was the dimmest thing here — grey micro type, the same rank as
                the qualifier below it — which had the second most persuasive fact
                on the panel whispering. Filled, it becomes the one other place
                the eye stops, and it is the same red the gate put on its unlock
                key: one filled thing per screen, and it is always the thing you
                are meant to act on. */}
            <span
              data-part="saving"
              className="mt-9 inline-block origin-center bg-brand-600 px-5 py-3 sm:px-6"
            >
              <span data-part="savingText" className={cn(MICRO, 'block font-semibold text-white')}>
                You save {formatNpr(saving)}
              </span>
            </span>
          </div>
        </div>

        {/* Same wording as the model page's price block, deliberately: the
            qualification on a price has to be phrased identically wherever it
            appears or the two read as different prices. */}
        <p data-part="where" className={cn(MICRO, 'mt-8 text-white/35')}>
          Ex-showroom, Kathmandu
        </p>
      </div>

      {/* The gate's chassis edge, carried through so the screen is bounded the
          same way the countdown was. Purely structural. */}
      <div
        aria-hidden="true"
        className={cn('absolute inset-x-6 bottom-6 border-t pt-4 text-center sm:inset-x-10', RULE)}
      >
        <span className={cn(MICRO, 'text-white/50')}>
          Dugar
          <span className="font-normal lowercase opacity-60">x</span>
          Revolt
        </span>
      </div>
    </div>
  )
}
